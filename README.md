# Personal Music Streaming Service (JH Music)

웹 브라우저 및 GitHub Pages에서 동작하는 고음질 개인용 음악 스트리밍 플레이어입니다.

## 🎵 주요 기능
- **Google Cloud Storage 초고속 스트리밍**: 0.1초 즉각 재생 및 부드러운 트랙 탐색
- **GitHub Pages 100% 호환**: 정적 웹 파일(HTML/CSS/JS/JSON)만으로 스마트폰, 태블릿, PC 어디서나 24시간 접속 가능
- **재생 컨트롤**: 재생/일시정지, 이전/다음 트랙, 셔플(랜덤), 반복(전체/한 곡) 모드 지원
- **미니멀 UI**: 곡명 우측 불필요한 ID 없이 트랙명만 노출되는 모던 다크 테마

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
