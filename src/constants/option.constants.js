// src/constants/option.constants.js

// --- ICE LEVEL (Đá) - Map với IceLevelEnum.cs ---
export const ICE_LEVEL = {
  NONE: 1,    // Không đá
  WARM: 2,    // Ấm
  HOT: 3,     // Nóng
  I30: 30,    // 30%
  I50: 50,    // 50%
  I70: 70,    // 70%
  I100: 100   // 100%
}

// Config hiển thị cho UI (Label ngắn gọn cho nút bấm)
export const ICE_LEVEL_UI = {
  [ICE_LEVEL.NONE]: { label: '0%', fullLabel: 'Không đá', value: 1 },
  [ICE_LEVEL.I30]: { label: '30%', fullLabel: '30% Đá', value: 30 },
  [ICE_LEVEL.I50]: { label: '50%', fullLabel: '50% Đá', value: 50 },
  [ICE_LEVEL.I70]: { label: '70%', fullLabel: '70% Đá', value: 70 },
  [ICE_LEVEL.I100]: { label: '100%', fullLabel: '100% Đá', value: 100 },
  [ICE_LEVEL.WARM]: { label: 'Ấm', fullLabel: 'Đồ uống ấm', value: 2 },
  [ICE_LEVEL.HOT]: { label: 'Nóng', fullLabel: 'Đồ uống nóng', value: 3 }
}

// --- SUGAR LEVEL (Đường) - Map với SugarLevelEnum.cs ---
export const SUGAR_LEVEL = {
  S0: 1,      // Không đường
  S30: 30,    // 30%
  S50: 50,    // 50%
  S70: 70,    // 70%
  S100: 100   // 100%
}

export const SUGAR_LEVEL_UI = {
  [SUGAR_LEVEL.S0]: { label: '0%', fullLabel: 'Không đường', value: 1 },
  [SUGAR_LEVEL.S30]: { label: '30%', fullLabel: '30% Đường', value: 30 },
  [SUGAR_LEVEL.S50]: { label: '50%', fullLabel: '50% Đường', value: 50 },
  [SUGAR_LEVEL.S70]: { label: '70%', fullLabel: '70% Đường', value: 70 },
  [SUGAR_LEVEL.S100]: { label: '100%', fullLabel: '100% Đường', value: 100 }
}

// Helper: Lấy danh sách option để render v-for
export const getIceOptions = () => Object.values(ICE_LEVEL_UI).sort((a, b) => a.value - b.value)
export const getSugarOptions = () => Object.values(SUGAR_LEVEL_UI).sort((a, b) => a.value - b.value)