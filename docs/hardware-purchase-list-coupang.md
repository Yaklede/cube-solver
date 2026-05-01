# 쿠팡 기준 하드웨어 구매 목록

확인일: 2026-05-02

## 구매 전략

큐브 자동 풀이 장치는 처음부터 6면 전체 구동 로봇을 만들기보다 다음 순서가 현실적이다.

1. 1축 proof-of-concept: 앱에서 명령을 보내면 모터 1개가 정확히 90도/180도 회전
2. 2~3축 jig: 특정 OLL/PLL/F2L/D-Cross 케이스를 섞는 연습 장치
3. 6축 cube robot: 전체 큐브 solve/scramble 자동화

## 바로 구매 권장

| 우선순위 | 품목 | 권장 수량 | 쿠팡 검색/상품 기준 | 이유 |
| --- | --- | ---: | --- | --- |
| 필수 | Arduino Uno R3 호환 보드 또는 스타터 키트 | 1 | 아두이노 우노 R3 스타터 키트 / 우노 R3 호환 보드 | Web Serial/Tauri serial 명령 수신용 기본 컨트롤러 |
| 필수 | 브레드보드 + 점퍼선 + MB102 전원 모듈 | 1세트 | 브레드보드 MB-102 830 포인트, 점퍼 와이어 | 모터 드라이버, 스위치, 전원 배선 테스트 |
| 필수 | 42각/NEMA17 12V 스텝모터 | 1~2 | 티앤디 아두이노 고토크 42각 스텝모터 12V / NEMA17 17HS4401 | 큐브 면을 90도 단위로 반복 회전시키는 actuator 후보 |
| 필수 | A4988 또는 DRV8825 스텝모터 드라이버 | 모터 수량 + 예비 1 | 아두이노 A4988 스텝 모터 드라이브 모듈 / DRV8825 모듈 | Arduino가 직접 모터 전류를 감당하지 않도록 분리 |
| 필수 | 12V DC 전원 + DC 터미널 젠더 | 1 | 12V 5A 이상 어댑터, DC 5.5 x 2.1mm 터미널 젠더 | 스텝모터 전원은 USB 전원으로 처리하면 안 됨 |
| 필수 | 리미트/엔드스톱 스위치 | 2~6 | 아두이노 엔드 스톱 리미트 스위치, CNC RAMPS 1.4용 | 초기 위치 calibration과 안전 정지 |
| 권장 | 16mm 푸쉬락/비상정지 스위치 | 1 | 12V~24V 푸쉬락 버튼, 비상정지/전원 ON/OFF 용도 | 모터 동작 중 즉시 정지 가능한 물리 버튼 |

## 6축 큐브 로봇 확장 시 추가 구매

| 품목 | 권장 수량 | 쿠팡 검색/상품 기준 | 판단 |
| --- | ---: | --- | --- |
| NEMA17/42각 스텝모터 | 총 6개 | 42각 스테핑모터 Nema17 17HS4401 | 6면을 독립 구동하려면 6개 필요 |
| DRV8825/TMC2209 드라이버 | 총 6~8개 | DRV8825, TMC2209 스테퍼 드라이버 | TMC2209는 조용하지만 설정 난도가 높음 |
| Arduino Mega 2560 | 1 | 아두이노 메가 2560 R3 호환보드 CH340 | Uno보다 I/O 여유가 커서 다축 제어에 적합 |
| RAMPS 1.4/1.5 또는 CNC shield | 1 | RAMPS 1.5, CNC Shield V3 | RAMPS는 다축에 유리, CNC Shield V3는 보통 4축까지가 편함 |
| 12V 10A급 전원 | 1 | 12V 10A SMPS/어댑터 | 모터 6개 동시 holding 전류를 고려 |
| 커플러/샤프트/베어링/프레임 | 설계별 | 3D 프린터/CNC 부품 | 큐브 grip과 회전축 정렬이 핵심 |

## 사지 않아도 되는 것

- RC카 키트: 모터/차체 실습용으로는 좋지만 큐브 면 회전 장치와 직접 관련이 낮다.
- MG996R 서보만으로 구성한 6면 로봇: 180도 서보는 위치 제어는 쉽지만 큐브 면을 안정적으로 여러 번 돌리는 구조에는 backlash와 토크 문제가 생길 수 있다. 초기 grip 실험용 1~2개 정도만 고려한다.
- 릴레이 보드: 스텝모터 정밀 제어에는 필요 없다.

## 추천 구매 묶음

### MVP 1축 테스트

- Arduino Uno R3 호환 보드 또는 스타터 키트 1개
- NEMA17/42각 12V 스텝모터 1개
- A4988 또는 DRV8825 2개
- 브레드보드/점퍼선/MB102 전원 모듈 1세트
- 12V 5A 이상 어댑터 1개
- DC 터미널 젠더 1세트
- 리미트 스위치 2개
- 푸쉬락 비상정지 버튼 1개

### 실제 큐브 로봇 v1

- Arduino Mega 2560 1개
- RAMPS 1.5 또는 6축 구성이 가능한 모터 제어 보드 1개
- NEMA17/42각 12V 스텝모터 6개
- DRV8825 또는 TMC2209 8개
- 12V 10A 이상 전원 1개
- 리미트 스위치 6개 이상
- 비상정지 스위치 1개
- 3D 프린팅 프레임/커플러/베어링/큐브 grip 부품

## 앱 연동 기준

- 앱은 실제 장치에 바로 명령을 보내지 않고 `DeviceCommandPreview`를 먼저 만든다.
- 사용자가 시작을 확인한 뒤 Web Serial 또는 Tauri serial adapter로 명령을 전송한다.
- 모든 장치 명령 전후에 카메라로 큐브 상태를 다시 검증한다.
- OLL/PLL/F2L/D-Cross 연습용 섞기는 `targetStage`, `targetCaseId`, `notation`, `safetyChecklist`를 포함한 명령으로 관리한다.

## 확인한 쿠팡 상품/검색 기준

- 아두이노 우노 R3 스타터 키트 센서 모듈 LCD LED IR: https://www.coupang.com/vp/products/6070712136
- 아두이노 실습 키트 우노 R3 고품질 호환 보드 ARD-S: https://www.coupang.com/vp/products/8659728758
- 브레드보드 전원 모듈 MB-102 830 포인트: https://www.coupang.com/vp/products/7369511242
- 티앤디 아두이노 고토크 42각 스텝모터 12V: https://www.coupang.com/vp/products/7699206457
- 42각 스테핑모터 Nema17 17HS4401: https://www.coupang.com/vp/products/7436816728
- 아두이노 A4988 스텝 모터 드라이브 모듈: https://www.coupang.com/vp/products/5736196848
- 아두이노 DRV8825 스테퍼모터 드라이버: https://www.coupang.com/vp/products/66505149
- 아두이노 CNC 쉴드 V3 A4988 드라이버 호환: https://www.coupang.com/vp/products/183809185
- 아두이노 메가 2560 R3 호환보드 CH340: https://www.coupang.com/vp/products/6824872689
- 아두이노 2560전용 3D프린터 컨트롤 보드 RAMPS 1.5: https://www.coupang.com/vp/products/1160521013
- 아두이노 엔드 스톱 리미트 스위치 및 케이블: https://www.coupang.com/vp/products/8842658802
- 16mm 플랫헤드 푸쉬락 버튼: https://www.coupang.com/vp/products/7214844037
- DC 5.5 x 2.1mm 터미널/전원 잭: https://www.coupang.com/vp/products/8640971094
