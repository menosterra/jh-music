# Personal Music Streaming Service (JH Music)

웹 브라우저 및 GitHub Pages에서 동작하는 고음질 개인용 음악 스트리밍 플레이어입니다.

## 🎵 주요 기능
- **GitHub Pages 100% 호환**: 정적 파일(HTML/CSS/JS/JSON/MP3) 기반으로 동작하여 서버 없이도 GitHub Pages를 통해 스마트폰, 태블릿, PC 어디서나 접속 및 재생 가능
- **오디오 스트리밍 & Seekbar**: 끊김 없는 고음질 연속 재생 및 부드러운 트랙 탐색
- **재생 컨트롤**: 재생/일시정지, 이전/다음 트랙, 셔플(랜덤), 반복(전체/한 곡) 모드 지원
- **깔끔한 UI**: 곡명 우측 불필요한 ID 없이 트랙명만 노출되는 모던 다크 테마

## 📁 프로젝트 구조
```
Music_Streaming_Service/
├── index.html            # 플레이어 웹 인터페이스
├── playlists.json        # 폴더 및 음원 목록 데이터
├── server.py             # 로컬 테스트용 스트리밍 서버
├── run_local_server.bat  # 로컬 원클릭 실행 배치 파일
├── sync_songs.py         # Google Drive 음원 동기화 도구
├── css/
│   └── style.css         # UI 디자인 및 스타일시트
├── js/
│   └── app.js            # 플레이어 프론트엔드 엔진
└── songs/                # 음악 파일 저장소 (장르별 폴더)
    ├── Bossanova/
    ├── Funk/
    ├── Groove/
    ├── Groove pop/
    └── Swing pop/
```

## 🚀 사용 및 배포 방법

### 1. 로컬에서 실행
- `run_local_server.bat`를 더블클릭하거나 터미널에서 `python server.py`를 실행한 후 `http://localhost:8000`에 접속합니다.

### 2. GitHub Pages 무료 배포
1. 저장소에 모든 파일을 커밋 & 푸시합니다:
   ```bash
   git add .
   git commit -m "feat: 음악 파일 및 정적 플레이어 구축"
   git push -u origin main
   ```
2. GitHub 저장소(`jh-music`)의 **Settings > Pages** 메뉴로 이동합니다.
3. **Build and deployment > Branch**에서 `main` 브랜치와 `/ (root)`를 선택하고 **Save**를 누릅니다.
4. 1~2분 후 생성되는 웹 링크(`https://menosterra.github.io/jh-music/`)로 스마트폰이나 다른 기기에서 언제 어디서나 접속하여 감상하실 수 있습니다.
