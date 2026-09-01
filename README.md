# Google Cloud 기반 음악 스트리밍 서비스

Google Cloud Storage(GCS)와 Google Cloud Run(무료 티어 최적화)을 이용한 경량 음악 스트리밍 웹 플레이어입니다.

## 📌 주요 구성
- **음원 저장소**: Google Cloud Storage (`music-stream` 버킷 `songs/` 경로)
- **프론트엔드/웹 서버**: [index.html](file:///c:/Project/Music_Streaming_Service/index.html), [server.py](file:///c:/Project/Music_Streaming_Service/server.py) (Cloud Run 컨테이너)
- **플레이리스트**: [playlists.json](file:///c:/Project/Music_Streaming_Service/playlists.json) (GCS 음원 URL 기반 107곡 구성 완료)

## 🚀 Google Cloud 무료 리소스 설정 (CPU / 메모리 최소화)
- **CPU**: 1 vCPU (요청 시에만 활성화)
- **Memory**: 128MiB (최소 메모리 할당)
- **인스턴스 수**: 최소 0개 (접속 없을 때 0으로 축소되어 과금 0원), 최대 1개
- **지역**: `us-central1` (Google Cloud Always Free Tier 지역)

---

## 🛠️ 배포 및 실행 방법

### 1. GCS 버킷 공개 설정 (최초 1회)
음원을 브라우저에서 스트리밍하기 위해 버킷의 읽기 권한을 공개로 설정합니다:
```bash
# 버킷 공개 액세스 차단 해제 및 읽기 권한 부여
gcloud storage buckets add-iam-policy-binding gs://music-stream --member=allUsers --role=roles/storage.objectViewer
gcloud storage buckets update gs://music-stream --cors-file=cors.json
```

### 2. Cloud Run 배포
[deploy_cloud_run.bat](file:///c:/Project/Music_Streaming_Service/deploy_cloud_run.bat) 파일을 더블 클릭하거나 아래 명령어를 실행합니다:
```bash
gcloud run deploy music-streaming-app --source . --region us-central1 --memory 128Mi --cpu 1 --min-instances 0 --max-instances 1 --allow-unauthenticated
```

### 3. 로컬 테스트
```bash
python server.py
# 브라우저에서 http://localhost:8080 접속
```

## 📁 저장소 구조
```
jh-music/
├── index.html            # 플레이어 웹 인터페이스
├── playlists.json        # 폴더 및 GCS 스트리밍 URL 데이터
├── README.md             # 프로젝트 설명서
├── .gitignore            # Git 제외 설정
├── css/
│   └── style.css         # UI 디자인 및 스타일시트
└── js/
    └── app.js            # 플레이어 프론트엔드 엔진
```

## 🌐 웹 플레이어 접속
**[https://menosterra.github.io/jh-music/](https://menosterra.github.io/jh-music/)**
