import React, { useState } from 'react';
import { 
  Server, Shield, Database, Cpu, Network, Lock, Globe, 
  Terminal, Check, Copy, AlertTriangle, Layers, Radio, Sparkles, HardDrive
} from 'lucide-react';

export const EnterpriseDeploymentSpec: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'k8s' | 'docker' | 'sovereignty' | 'security'>('k8s');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const K8S_MANIFEST = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: vfs-edge-ai-inference-engine
  namespace: vfs-production
  labels:
    app: vfs-edge-ai
    tier: consular-inspection
    compliance: gdpr-fips-140-2
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: vfs-edge-ai
  template:
    metadata:
      labels:
        app: vfs-edge-ai
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        security.vfs.global/hardware-hsm: "enabled"
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: topology.kubernetes.io/region
                operator: In
                values: ["eu-west-1", "eu-central-1", "me-central-1", "ap-southeast-1"]
      containers:
      - name: idp-cv-inference-worker
        image: cr.vfs.global/vision/idp-ensemble:v4.8.2-cuda12
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            cpu: "8000m"
            memory: "16Gi"
            nvidia.com/gpu: "1" # Local TensorRT GPU acceleration for <50ms OCR/PAD
          requests:
            cpu: "2000m"
            memory: "4Gi"
            nvidia.com/gpu: "1"
        ports:
        - containerPort: 8443
          name: https-grpc
        - containerPort: 9090
          name: metrics
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATA_SOVEREIGNTY_REGION
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['topology.kubernetes.io/region']
        - name: PII_EPHEMERAL_STORAGE_TTL_SECS
          value: "0" # Zero-disk storage policy (RAM disk only for raw scans)
        - name: TLS_CERT_PATH
          value: "/etc/ssl/certs/vfs-edge-tls.crt"
        - name: HSM_KEY_SLOT
          value: "PKCS11_SLOT_0"
        volumeMounts:
        - name: ramdisk-scratch
          mountPath: /dev/shm
        - name: hsm-socket
          mountPath: /var/run/hsm
        securityContext:
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 10001
          capabilities:
            drop: ["ALL"]
      volumes:
      - name: ramdisk-scratch
        emptyDir:
          medium: Memory
          sizeLimit: 2Gi
      - name: hsm-socket
        hostPath:
          path: /var/run/vfs-hsm-pkcs11.sock
---
apiVersion: v1
kind: Service
metadata:
  name: vfs-edge-ai-service
  namespace: vfs-production
spec:
  type: ClusterIP
  ports:
  - port: 443
    targetPort: https-grpc
    protocol: TCP
    name: https
  selector:
    app: vfs-edge-ai`;

  const DOCKER_COMPOSE_EDGE = `version: '3.9'

services:
  # Edge Gateway & Reverse Proxy with TLS 1.3 & mTLS
  edge-gateway:
    image: nginx:1.25-alpine
    container_name: vfs-edge-reverse-proxy
    restart: always
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/ssl/vfs-certs:ro
    networks:
      - vfs-internal-mesh
    security_opt:
      - no-new-privileges:true

  # High-Speed Computer Vision OCR & Presentation Attack Detection (PAD)
  cv-idp-inference:
    image: cr.vfs.global/vision/idp-ensemble:v4.8.2
    container_name: vfs-cv-idp-engine
    restart: always
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    environment:
      - CUDA_VISIBLE_DEVICES=0
      - TENSORRT_OPTIMIZATION_LEVEL=5
      - ZERO_PII_DISK_RETENTION=true
      - ICAO_9303_CHECKSUM_STRICT=true
    volumes:
      - type: tmpfs
        target: /dev/shm
        tmpfs:
          size: 2147483648 # 2GB RAM Disk (Volatile memory for zero data remnants)
    networks:
      - vfs-internal-mesh

  # Real-Time Anti-Bot & Isolation Forest Behavioral Engine
  anti-bot-ml-engine:
    image: cr.vfs.global/security/anti-bot-pipeline:v3.1
    container_name: vfs-anti-bot-ml
    restart: always
    environment:
      - MODEL_TYPE=ISOLATION_FOREST_XGBOOST_ENSEMBLE
      - INFERENCE_LATENCY_BUDGET_MS=5
      - BOT_SCORE_HARD_BLOCK_THRESHOLD=80
      - TELEMETRY_ENTROPY_MIN_BITS=3.8
    networks:
      - vfs-internal-mesh

  # Real-Time SSE/WebSocket Hub for Consular Staff Live Synchronization
  realtime-sync-bus:
    image: node:20-alpine
    container_name: vfs-realtime-sse-bus
    restart: always
    environment:
      - PORT=8080
      - CORS_ORIGIN=https://consular.vfs.global
      - SSE_KEEPALIVE_INTERVAL_MS=15000
    networks:
      - vfs-internal-mesh

networks:
  vfs-internal-mesh:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16`;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0066FF] text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded">
              STAGE 5 PRODUCTION SPECIFICATION
            </span>
            <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#0066FF]" />
              Enterprise Containerized Deployment & Edge AI Inference
            </h3>
          </div>
          <p className="text-xs text-[#8892B0] mt-1">
            Production Kubernetes (K8s) & Docker specifications for low-latency AI inference at local VAC centers with end-to-end data sovereignty and encryption.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F4F6F8] p-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('k8s')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'k8s' ? 'bg-[#0066FF] text-white shadow-xs font-bold' : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Kubernetes Manifest
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docker')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'docker' ? 'bg-[#0066FF] text-white shadow-xs font-bold' : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Docker Compose (Edge)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sovereignty')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sovereignty' ? 'bg-[#0066FF] text-white shadow-xs font-bold' : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Data Sovereignty (GDPR)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'security' ? 'bg-[#0066FF] text-white shadow-xs font-bold' : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            E2E Cryptography
          </button>
        </div>
      </div>

      {/* 4 Informational Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#FF9900] text-xs font-mono font-bold">Edge AI Inference</span>
            <Cpu className="w-4 h-4 text-[#FF9900]" />
          </div>
          <p className="text-[11px] text-[#8892B0]">
            Local NVIDIA TensorRT GPU workers execute ICAO 9303 OCR & 3D PAD liveness under <strong>&lt; 48ms</strong> directly at the Visa Application Centre hub.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 text-xs font-mono font-bold">Zero Data Remnants</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[11px] text-[#8892B0]">
            Applicant biometric frames and scanned passport images are processed exclusively in volatile <code>/dev/shm</code> RAM disks and purged post-inference.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#0066FF] text-xs font-mono font-bold">Data Sovereignty</span>
            <Globe className="w-4 h-4 text-[#0066FF]" />
          </div>
          <p className="text-[11px] text-[#8892B0]">
            Topology-aware geographic pinning enforces that dossiers never cross sovereign jurisdictional borders (EU GDPR / UAE / UK / India regulations).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 text-xs font-mono font-bold">FIPS 140-2 HSM</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-[11px] text-[#8892B0]">
            Hardware Security Modules (HSMs) anchor all appointment locks, consular seals, and SHA-256 applicant hashes with tamper-proof attestation.
          </p>
        </div>
      </div>

      {/* Code Display Pane */}
      {activeTab === 'k8s' && (
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-3 font-mono text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">vfs-edge-ai-deployment.yaml (Production K8s with GPU Affinity & RAM Disk)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(K8S_MANIFEST, 'k8s')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-bold flex items-center gap-1.5 transition-all"
            >
              {copiedCode === 'k8s' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'k8s' ? 'Copied' : 'Copy YAML'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto text-[11px] text-[#8892B0] max-h-96 leading-relaxed">
            {K8S_MANIFEST}
          </pre>
        </div>
      )}

      {activeTab === 'docker' && (
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-3 font-mono text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#0066FF]" />
              <span className="font-bold">docker-compose.edge-vac.yml (Local Visa Center Edge Cluster)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(DOCKER_COMPOSE_EDGE, 'docker')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-bold flex items-center gap-1.5 transition-all"
            >
              {copiedCode === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'docker' ? 'Copied' : 'Copy Compose'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto text-[11px] text-[#8892B0] max-h-96 leading-relaxed">
            {DOCKER_COMPOSE_EDGE}
          </pre>
        </div>
      )}

      {activeTab === 'sovereignty' && (
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-4 font-mono text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0066FF]" />
              <span className="font-bold">Data Sovereignty & Cross-Border Transfer Compliance Architecture</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-[#8892B0]">
            <div className="p-4 bg-[#0A192F] rounded-lg border border-white/5 space-y-2">
              <h5 className="text-white font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                EU General Data Protection Regulation (GDPR)
              </h5>
              <p>
                Strict residency locking for Schengen dossiers. All biometric vectors and passport metadata are pinned to EU-Central (Frankfurt) and EU-West (Dublin) Kubernetes clusters. Data at rest is encrypted with customer-managed keys (CMEK).
              </p>
            </div>

            <div className="p-4 bg-[#0A192F] rounded-lg border border-white/5 space-y-2">
              <h5 className="text-white font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FF9900]" />
                PII De-Identification & Anonymization Engine
              </h5>
              <p>
                Every prompt routed to the LLM Guidance Agent is stripped of passport numbers, applicant names, telephone numbers, and MRZ characters using deterministic surrogate tokens before leaving the client container boundary.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-4 font-mono text-xs text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="font-bold">End-to-End Cryptography & Hardware Attestation Specification</span>
            </div>
          </div>

          <div className="p-4 bg-[#0A192F] rounded-lg border border-white/5 space-y-2 text-[11px] text-[#8892B0]">
            <div><span className="text-white font-bold">Transport Layer:</span> TLS 1.3 with AES-256-GCM cipher suites and Mutual TLS (mTLS) authentication between VAC edge nodes and consular central nodes.</div>
            <div><span className="text-white font-bold">Digital Signatures:</span> eIDAS compliant PDF Advanced Electronic Signatures (PAdES-B-LT) with timestamp tokens issued by Qualified Trust Service Providers (QTSP).</div>
            <div><span className="text-white font-bold">Biometric Template Protection:</span> ISO/IEC 24745 cancelable biometric transforms; raw 512-dimension face vectors are encrypted with irreversible key binding before transmission.</div>
          </div>
        </div>
      )}
    </div>
  );
};
