# VFS Global AI & Computer Vision Microservice (FastAPI)

Production-grade Computer Vision and Rules Engine microservice engineered to eliminate **Manual Document Checking and Error Risks** (Problem 1) in consular visa processing workflows.

---

## 🏛 Four Core CV/AI Modules

### 1. Advanced OCR & Layout Analysis (`/api/v1/cv/ocr-layout`)
- **ICAO Doc 9303 MRZ Engine**: Decodes 2-line TD3 passport MRZs, verifying Modulo-7 check digits on document numbers, DOBs, and expiration dates.
- **LayoutLMv3 Document Classification**: Automatically classifies incoming documents (`PASSPORT`, `BANK_STATEMENT_3M`, `TRAVEL_INSURANCE_SCHENGEN`, `FLIGHT_ITINERARY`, `HOTEL_BOOKING`).
- **Normalized Visual Bounding Boxes**: Outputs normalized coordinates `[x, y, w, h]` (0-100%) for live UI highlight rendering.

### 2. Government Rules Engine (`/api/v1/cv/rules-engine`)
- **Passport Validity Buffer (`RULE-PASSPORT-VALIDITY-6M`)**: Enforces $\ge 6$ months remaining validity beyond intended departure date (Schengen Visa Code Art. 12(a)).
- **Schengen Insurance Coverage (`RULE-INS-EXPIRY-AND-MIN-COVERAGE`)**: Validates insurance covers full duration with $\ge €30,000$ medical emergency and repatriation coverage (Visa Code Art. 15).
- **3-Month Continuous Bank Statements (`RULE-BANK-3M-CONTINUOUS-FUNDS`)**: Ensures 90-day continuous transaction ledger with sufficient subsistence funds ($\ge €65/\text{day}$).
- **Cross-Document Name Alignment (`RULE-CROSS-DOC-NAME-MATCH`)**: Levenshtein distance string matching across passport, bank accounts, and airline tickets.

### 3. Biometric Photo Verification (`/api/v1/cv/biometric-verify`)
- **NIST FRVT 1:1 Matching**: Cosine similarity score on 512-dimensional facial embeddings.
- **ICAO Doc 9303 / ISO/IEC 19794-5 Quality Compliance**:
  - **Background Purity & Uniformity**: $\ge 90.0\%$ uniformity index.
  - **Dimension Check**: 35mm $\times$ 45mm frame with $70-80\%$ face coverage.
  - **3D Head Pose Angle**: Strict Yaw, Pitch, Roll tolerance ($\le \pm 5.0^\circ$).
  - **ISO/IEC 30107-3 Liveness & PAD**: Presentation Attack Detection against printed/screen replay spoofing.

### 4. Forgery & Tamper Detection (`/api/v1/cv/forgery-ela-check`)
- **Pixel-Level Error Level Analysis (ELA)**: Evaluates high-frequency compression difference ratios from 95% JPEG recompression matrices to detect spliced numerals.
- **Font Kerning & Glyph Stroke Metric Analysis**: Identifies injected text rendered in disparate fonts (e.g. ArialMT injected into Helvetica-Bold financial tables).
- **Incremental PDF Stream Forensics**: Detects post-signing modifications.

---

## 🚀 How to Run Locally

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment & install requirements
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger UI will be available at: `http://localhost:8000/docs`
