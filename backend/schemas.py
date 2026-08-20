from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# ============================================================================
# 1. ADVANCED OCR & LAYOUT ANALYSIS SCHEMAS
# ============================================================================

class BoundingBox(BaseModel):
    x: float = Field(..., description="Normalized X coordinate (0-100%)")
    y: float = Field(..., description="Normalized Y coordinate (0-100%)")
    w: float = Field(..., description="Normalized Width (0-100%)")
    h: float = Field(..., description="Normalized Height (0-100%)")
    label: str
    confidence: float = Field(default=0.98, ge=0.0, le=1.0)
    text_content: Optional[str] = None
    is_tampered: Optional[bool] = False

class MrzAnalysisResult(BaseModel):
    mrz_line1: str
    mrz_line2: str
    mrz_line3: Optional[str] = None
    checksum_valid: bool
    document_code: str
    issuing_state: str
    primary_identifier: str  # Surname
    secondary_identifier: str  # Given Names
    passport_number: str
    nationality: str
    date_of_birth: str  # YYYY-MM-DD
    gender: Literal['M', 'F', 'X']
    date_of_expiry: str  # YYYY-MM-DD
    composite_check_digit_valid: bool

class OcrLayoutExtractionResponse(BaseModel):
    document_type: Literal[
        'PASSPORT',
        'BANK_STATEMENT_3M',
        'TRAVEL_INSURANCE_SCHENGEN',
        'FLIGHT_ITINERARY',
        'HOTEL_BOOKING',
        'EMPLOYMENT_NOC',
        'UNKNOWN'
    ]
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    extracted_fields: Dict[str, Any]
    mrz_data: Optional[MrzAnalysisResult] = None
    bounding_boxes: List[BoundingBox]
    resolution_dpi: int
    page_count: int

# ============================================================================
# 2. GOVERNMENT RULES ENGINE SCHEMAS
# ============================================================================

class RuleCheckItem(BaseModel):
    rule_id: str
    title: str
    category: Literal['PASSPORT_VALIDITY', 'INSURANCE_COVERAGE', 'FINANCIAL_SUBSISTENCE', 'IDENTITY_ALIGNMENT', 'SCHENGEN_COMPLIANCE']
    passed: bool
    severity: Literal['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    statutory_code: str
    observed_value: Any
    expected_threshold: Any
    description: str
    remediation_action: Optional[str] = None
    target_bounding_box: Optional[BoundingBox] = None

class GovernmentRulesEvaluationRequest(BaseModel):
    destination_country: str
    intended_entry_date: str  # YYYY-MM-DD
    intended_exit_date: str  # YYYY-MM-DD
    visa_category: str
    extracted_passport: Dict[str, Any]
    extracted_documents: List[Dict[str, Any]]

class GovernmentRulesEvaluationResponse(BaseModel):
    overall_compliant: bool
    total_rules_evaluated: int
    rules_passed_count: int
    rules_failed_count: int
    risk_score_penalty: int = Field(..., ge=0, le=100)
    rule_results: List[RuleCheckItem]
    action_required: Literal['NONE', 'DOCUMENT_REUPLOAD', 'MFA_ESCALATION', 'STATUTORY_REFUSAL']

# ============================================================================
# 3. BIOMETRIC PHOTO VERIFICATION SCHEMAS
# ============================================================================

class HeadPoseAngles(BaseModel):
    yaw: float = Field(..., description="Head rotation left/right in degrees (-180 to 180)")
    pitch: float = Field(..., description="Head tilt up/down in degrees (-90 to 90)")
    roll: float = Field(..., description="Head tilt side-to-side in degrees (-180 to 180)")
    is_frontal: bool

class IcaoPhotoConstraints(BaseModel):
    background_purity_score: float = Field(..., ge=0.0, le=100.0, description="Uniform white/light grey background check")
    dimension_check_passed: bool = Field(..., description="Standard 35mm x 45mm proportion check")
    face_coverage_percentage: float = Field(..., ge=0.0, le=100.0, description="Face covers 70-80% of frame")
    head_pose: HeadPoseAngles
    eyes_open: bool
    neutral_expression: bool
    glare_detected: bool
    all_constraints_met: bool

class BiometricVerificationResponse(BaseModel):
    facial_match_score: float = Field(..., ge=0.0, le=100.0, description="1:1 NIST FRVT vector similarity")
    is_match: bool
    match_threshold: float = Field(default=85.0)
    liveness_pad_score: float = Field(..., ge=0.0, le=100.0, description="ISO/IEC 30107-3 presentation attack detection")
    liveness_passed: bool
    icao_constraints: IcaoPhotoConstraints
    flagged_reasons: List[str]

# ============================================================================
# 4. FORGERY & TAMPER DETECTION (ELA) SCHEMAS
# ============================================================================

class TamperAnomaly(BaseModel):
    anomaly_id: str
    anomaly_type: Literal[
        'ELA_COMPRESSION_SPIKE',
        'FONT_METRIC_INCONSISTENCY',
        'SPLICED_TEXT_BOUNDARY',
        'METADATA_STREAM_TAMPER',
        'CLONED_PIXEL_REGION'
    ]
    confidence: float
    description: str
    bounding_box: BoundingBox
    severity: Literal['MEDIUM', 'HIGH', 'CRITICAL']

class TamperDetectionResponse(BaseModel):
    tamper_detected: bool
    overall_integrity_score: float = Field(..., ge=0.0, le=100.0)
    ela_max_difference_ratio: float
    font_inconsistency_score: float
    metadata_alteration_detected: bool
    anomalies: List[TamperAnomaly]
    ela_heatmap_base64: Optional[str] = None

# ============================================================================
# 5. UNIFIED DOSSIER INGESTION SCHEMAS (FULL PIPELINE)
# ============================================================================

class UnifiedDossierInspectionResponse(BaseModel):
    dossier_reference: str
    timestamp_utc: str
    overall_risk_score: int = Field(..., ge=0, le=100)
    recommendation: Literal['APPROVE_FAST_TRACK', 'MANUAL_OFFICER_REVIEW', 'REQUEST_REUPLOAD', 'REFUSE_STATUTORY']
    ocr_results: Dict[str, OcrLayoutExtractionResponse]
    rules_engine: GovernmentRulesEvaluationResponse
    biometric_verification: BiometricVerificationResponse
    tamper_detection: Dict[str, TamperDetectionResponse]
    ui_error_banners: List[Dict[str, Any]]
    ui_highlight_boxes: List[Dict[str, Any]]
