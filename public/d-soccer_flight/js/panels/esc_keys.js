// ESC 설정 묶음의 칸 순서 = 바이트 순서(ProtocolDrone.cs EscConfigNovaX / EscConfigBLHeli_S .ToArray · crates/fw esc/config.rs)
export const NOVAX = ["motorIndex", "Eep_FW_Main_Revision", "Eep_FW_Sub_Revision", "Eep_Pgm_Startup_Power_Min", "Eep_Pgm_Startup_Beep",
  "Eep_Pgm_Dithering", "Eep_Pgm_Startup_Power_Max", "Eep_Pgm_Rpm_Power_Slope", "Eep_Pgm_Pwm_Freq", "Eep_Pgm_Direction",
  "Eep_Pgm_Braking_Strength", "Eep_Pgm_Comm_Timing", "Eep_Pgm_Beep_Strength", "Eep_Pgm_Beacon_Strength", "Eep_Pgm_Beacon_Delay",
  "Eep_Pgm_Demag_Comp", "Eep_Pgm_Temp_Prot_Enable", "Eep_Pgm_Brake_On_Stop", "Eep_Pgm_LED_Control"];
export const BLHELI = ["motorIndex", "Eep_FW_Main_Revision", "Eep_FW_Sub_Revision", "Eep_Layout_Revision", "Eep_Pgm_Startup_Pwr",
  "Eep_Pgm_Pwm_Freq", "Eep_Pgm_Direction", "Eep_Pgm_Comm_Timing", "Eep_Pgm_Min_Throttle", "Eep_Pgm_Max_Throttle",
  "Eep_Pgm_Beep_Strength", "Eep_Pgm_Beacon_Strength", "Eep_Pgm_Beacon_Delay", "Eep_Pgm_Demag_Comp", "Eep_Pgm_Temp_Prot_Enable",
  "Eep_Pgm_Brake_On_Stop", "Eep_Pgm_LED_Control"];
/** 묶음 바이트(19 = NovaX · 17 = BLHeli_S) → 칸 이름 붙은 값 */
export const configFromBytes = (bytes) => Object.fromEntries((bytes.length === NOVAX.length ? NOVAX : BLHELI).map((k, i) => [k, bytes[i]]));
