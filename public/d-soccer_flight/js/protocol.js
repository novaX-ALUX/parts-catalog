// 통신 약속(프로토콜) 번호표 — 화면에서 보낼 내용(payload)을 만들 때 쓴다.
// 원본 Unity C# 의 이름을 그대로 쓴다. C# 의 가운데 `.Type` 층만 뺐다:
//   C#  (byte)DataType.Type.Command          →  JS  DataType.Command
//   C#  (byte)LED.Drone.Mode.Type.TeamRgbHold →  JS  LED.Drone.Mode.TeamRgbHold
// 끝 표시(EndOfType)는 실제로 보내는 값이 아니라 넣지 않았다.
// 같은 번호의 Rust 쪽 정본: crates/proto/src/consts.rs (DataType · DeviceType · CommandType · ModelNumber · EscInfoCommand)
//
// 보내기: invoke('link_send', { dataType, payload: [...바이트], to })
//   - to 를 빼면 드론(DeviceType.Drone)으로 간다 — 원본 CreateSendData 기본값과 같다(조종기와 연결돼 있어도).

const deepFreeze = (o) => {
  for (const v of Object.values(o)) if (typeof v === 'object' && v !== null) deepFreeze(v);
  return Object.freeze(o);
};

/** 내용 종류 — Protocol.cs DataType.Type */
export const DataType = deepFreeze({
  None: 0x00, Ping: 0x01, Ack: 0x02, Error: 0x03, Request: 0x04, Message: 0x05, Address: 0x06,
  Information: 0x07, Monitor: 0x0F, Control: 0x10,
  Command: 0x11, Pairing: 0x12, ResponseRate: 0x13, TimeSync: 0x14, TransmissionPower: 0x15, Configuration: 0x16,
  Deadzone: 0x19, DroneSettingState: 0x1A,   // 조종기 1.3.0 부터 — 막대 데드존 % · 맡아 둔 드론 설정 상태
  CpuId: 0x1E, Battle: 0x1F,
  LightManual: 0x20, LightMode: 0x21, LightEvent: 0x22, LightDefault: 0x23,
  RawMotion: 0x30, PidConfigure: 0x3F,
  State: 0x40, Attitude: 0x41, Position: 0x42, Altitude: 0x43, Motion: 0x44, VisionSensor: 0x47,
  Count: 0x50, Bias: 0x51, Trim: 0x52, Weight: 0x53, LostConnection: 0x54,
  Motor: 0x60, MotorOrder: 0x61, Buzzer: 0x62, Vibrator: 0x63, Battery: 0x64, MotorKV: 0x65,
  EscUpdateRequest: 0x6C, EscUpdate: 0x6D, EscInfo: 0x6E, EscConfig: 0x6F,
  Button: 0x70, Joystick: 0x71,
  InformationAssembledForController: 0xA0,
});

/** 장치 주소(보낸이·받는이) — Protocol.cs DeviceType.Type */
export const DeviceType = deepFreeze({
  None: 0x00, Drone: 0x10, Controller: 0x20,
  LinkClient: 0x30, LinkServer: 0x31, BleClient: 0x32, BleServer: 0x33,
  Range: 0x40, RF: 0x50, Gun: 0x60, Base: 0x70,
  ByScratch: 0x80, Scratch: 0x81, Entry: 0x82,
  Tester: 0xA0, Monitor: 0xA1, Updater: 0xA2, Encrypter: 0xA3,
  Whispering: 0xFE, Broadcasting: 0xFF,
});

/** 명령 종류(DataType.Command 내용 첫 바이트) — Protocol.cs CommandType.Type */
export const CommandType = deepFreeze({
  None: 0x00, Stop: 0x01, ModeFlight: 0x02, Headless: 0x03, ControlSpeed: 0x04,
  ClearBias: 0x05, ClearTrim: 0x06, FlightEvent: 0x07, SetDefault: 0x08, Backlight: 0x09,
  ModeController: 0x0A, Link: 0x0B, LoadDefaultColor: 0x0C, TransmissionPower: 0x0E, Trim: 0x0D, ClearJoystick: 0x0F,
  SetPidDefault: 0xFC, RfChannel: 0xFD, RfModulate: 0xFE, ModeTest: 0xF0,
});

/** 조종기 설정 꾸러미(Configuration 22바이트)의 첫 바이트 깃발 — 펌웨어 Protocol::ConfigurationOption */
export const ConfigurationOption = deepFreeze({ FhssAOff: 0x01, Backlight: 0x02, Buzzer: 0x04, Vibrator: 0x08, PairAlarm: 0x10, JoystickMode1: 0x20 });

/** 드론 충돌 자세 유지 단계(드론 Configuration 첫 바이트) — 펌웨어 Protocol::CrashHold */
export const CrashHold = deepFreeze({ Off: 0, Estimate: 1, Full: 2, EndOfType: 3 });

/** 비행 이벤트(CommandType.FlightEvent 뒤 바이트) — BaseSystem.cs FlightEvent.Type */
export const FlightEvent = deepFreeze({
  None: 0x00, Stop: 0x10, Takeoff: 0x11, Landing: 0x12, Reverse: 0x13,
  FlipFront: 0x14, FlipRear: 0x15, FlipLeft: 0x16, FlipRight: 0x17, Return: 0x18,
  Shot: 0x90, UnderAttack: 0x91, ResetHeading: 0xA0,
});

/** 비행 상태(State.modeFlight) — Protocol.cs FlightState.Type */
export const FlightState = deepFreeze({
  None: 0x00, Ready: 0x10, Takeoff: 0x11, Flight: 0x12, Landing: 0x13, Stop: 0x20, Accident: 0x30, Error: 0x31,
});

/** 모터 회전 방향(Motor 내용 첫 바이트) — Protocol.cs Direction.Type */
export const Direction = deepFreeze({ None: 0x00, CW: 0x01, CCW: 0x02 });

/** 모터 고르기(Motor 내용 둘째 바이트) — Protocol.cs Parts.Type */
export const Parts = deepFreeze({ None: 0x00, M1: 0x01, M2: 0x02, M3: 0x04, M4: 0x08, All: 0x0F });

/** 모터 순서 — ProtocolDrone.cs MotorOrder.Type */
export const MotorOrder = deepFreeze({
  MOrder_1234: 0, MOrder_1243: 1, MOrder_1324: 2, MOrder_1342: 3, MOrder_1432: 4, MOrder_1423: 5,
  MOrder_2134: 6, MOrder_2143: 7, MOrder_2314: 8, MOrder_2341: 9, MOrder_2431: 10, MOrder_2413: 11,
  MOrder_3214: 12, MOrder_3241: 13, MOrder_3124: 14, MOrder_3142: 15, MOrder_3412: 16, MOrder_3421: 17,
  MOrder_4231: 18, MOrder_4213: 19, MOrder_4321: 20, MOrder_4312: 21, MOrder_4132: 22, MOrder_4123: 23,
});

const statusModes = {
  // Status
  StatusNone: 0x10, StatusManual: 0x11, StatusHold: 0x12, StatusFlicker: 0x13, StatusFlickerDouble: 0x14,
  StatusDimming: 0x15, StatusSunrise: 0x16, StatusSunset: 0x17, StatusRainbow: 0x18, StatusRainbow2: 0x19, StatusRedBlue: 0x1A,
};
const positionTeamModes = {
  // Position
  PositionNone: 0x20, PositionManual: 0x21, PositionHold: 0x22, PositionFlicker: 0x23, PositionFlickerDouble: 0x24,
  PositionDimming: 0x25, PositionSunrise: 0x26, PositionSunset: 0x27, PositionRainbow: 0x28, PositionRainbow2: 0x29, PositionRedBlue: 0x2A,
  // TeamRgb
  TeamRgbNone: 0x30, TeamRgbManual: 0x31, TeamRgbHold: 0x32, TeamRgbFlicker: 0x33, TeamRgbFlickerDouble: 0x34,
  TeamRgbDimming: 0x35, TeamRgbSunrise: 0x36, TeamRgbSunset: 0x37, TeamRgbRainbow: 0x38, TeamRgbRainbow2: 0x39, TeamRgbRedBlue: 0x3A,
};

/**
 * LED 모드·색 깃발 — LightMod.cs namespace LED.
 * LightMode 내용 꼴(LEDSetting.cs): [모드, 밝기, 0, r, g, b] — 끌 때는 [LED.Drone.Mode.PositionManual, 0xFF, 0xFF, 0]
 */
export const LED = deepFreeze({
  Drone: {
    Mode: { None: 0, ...statusModes, ...positionTeamModes },
    Flags: {
      None: 0x0000,
      StatusRed: 0x0001, StatusGreen: 0x0002, StatusBlue: 0x0004,
      PositionRed: 0x0008, PositionGreen: 0x0010, PositionBlue: 0x0020,
      TeamRgbRed: 0x0040, TeamRgbGreen: 0x0080, TeamRgbBlue: 0x0100,
      All: 0x0FFF,
    },
  },
  Controller: {
    Mode: { None: 0, ...positionTeamModes },
    Flags: { None: 0x00, PositionRed: 0x0001, PositionGreen: 0x0002, PositionBlue: 0x0004 },
  },
});

/** 화면이 알아보는 LED 색 이름 — SerialManager.cs ColorType (Team_LEDColor·Position_LEDColor 가 돌려주는 값) */
export const ColorType = deepFreeze({
  None: 0, Red: 1, Blue: 2, Green: 3, Yellow: 4, Cyan: 5, White: 6, Magenta: 7,
});

/**
 * 색 이름 → [r, g, b] — LEDSetting.Change_PositionLED / Change_TeamLED 와 SerialManager.Position_LEDColor 의 숫자
 * (C# 에는 표 이름이 없다. 팀 색은 Red·Blue 만 쓴다.)
 */
export const ColorRgb = deepFreeze({
  Red: [255, 0, 0], Blue: [0, 0, 255], Green: [0, 255, 0], Yellow: [255, 255, 0],
  Cyan: [0, 255, 255], White: [255, 255, 255], Magenta: [255, 0, 255],
});

/**
 * EscInfo 내용 첫 바이트(ESC 명령). 내용 꼴: [명령, 모터 번호, 0]
 * C# 에는 이름이 없어 보내는 함수 이름(ESCManager.SendEscInfo_Bootload / _Update / _Reset / _Read)에서 따왔다.
 */
export const EscInfoCommand = deepFreeze({ Bootload: 0x00, Update: 0x28, Reset: 0x35, Read: 0x3A });

/**
 * 연결할 때 알아보는 모델 번호 — 받은 Information.modelNumber(원본 C# 순서 = 위 바이트 먼저로 읽은 값)와 비교한다.
 * 펌웨어 이름: DroneP2 = Drone_13_Drone_P2(v1.1.3 전), DroneP3 = Drone_13_Drone_P3(v1.1.3 이후), Controller = Drone_13_Controller_P2.
 * 원본 SerialManager 는 DroneP2 만 받았다 — 새 앱은 둘 다 드론이다(isDroneModel).
 */
export const ModelNumber = deepFreeze({ DroneP2: 0x02100d00, DroneP3: 0x03100d00, Controller: 0x02200d00 });

/** 드론 모델 번호인가(P2·P3) — Rust ModelNumber::is_drone 과 같음 */
export const isDroneModel = (v) => v === ModelNumber.DroneP2 || v === ModelNumber.DroneP3;
