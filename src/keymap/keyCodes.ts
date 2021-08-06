export const enum KeyCode {
    /**
     * key codes that is less than 64 are composbale with other key codes
     */

    Backspace = 1,
    Tab = 2,
    Space = 3,
    PageUp = 4,
    PageDown = 5,
    End = 6,
    Home = 7,
    LeftArrow = 8,
    UpArrow = 9,
    RightArrow = 10,
    DownArrow = 11,
    Insert = 12,
    Delete = 13,

    KEY_0 = 17,
    KEY_1 = 18,
    KEY_2 = 19,
    KEY_3 = 20,
    KEY_4 = 21,
    KEY_5 = 22,
    KEY_6 = 23,
    KEY_7 = 24,
    KEY_8 = 25,
    KEY_9 = 26,

    KEY_A = 27,
    KEY_B = 28,
    KEY_C = 29,
    KEY_D = 30,
    KEY_E = 31,
    KEY_F = 32,
    KEY_G = 33,
    KEY_H = 34,
    KEY_I = 35,
    KEY_J = 36,
    KEY_K = 37,
    KEY_L = 38,
    KEY_M = 39,
    KEY_N = 40,
    KEY_O = 41,
    KEY_P = 42,
    KEY_Q = 43,
    KEY_R = 44,
    KEY_S = 45,
    KEY_T = 46,
    KEY_U = 47,
    KEY_V = 48,
    KEY_W = 49,
    KEY_X = 50,
    KEY_Y = 51,
    KEY_Z = 52,

    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ';:' key
     */
    US_SEMICOLON = 53,
    /**
     * For any country/region, the '+' key
     * For the US standard keyboard, the '=+' key
     */
    US_EQUAL = 54,
    /**
     * For any country/region, the ',' key
     * For the US standard keyboard, the ',<' key
     */
    US_COMMA = 55,
    /**
     * For any country/region, the '-' key
     * For the US standard keyboard, the '-_' key
     */
    US_MINUS = 56,
    /**
     * For any country/region, the '.' key
     * For the US standard keyboard, the '.>' key
     */
    US_DOT = 57,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '/?' key
     */
    US_SLASH = 58,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '`~' key
     */
    US_BACKTICK = 59,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '[{' key
     */
    US_OPEN_SQUARE_BRACKET = 60,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '\|' key
     */
    US_BACKSLASH = 61,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ']}' key
     */
    US_CLOSE_SQUARE_BRACKET = 62,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ''"' key
     */
    US_QUOTE = 63,



    /**
     * simple key codes
     */

    Enter = 64,
    Escape = 65,
    PauseBreak = 66,
    CapsLock = 67,

    Shift = 68,
    Ctrl = 69,
    Alt = 70,
    Meta = 71,
    ContextMenu = 72,

    F1 = 73,
    F2 = 74,
    F3 = 75,
    F4 = 76,
    F5 = 77,
    F6 = 78,
    F7 = 79,
    F8 = 80,
    F9 = 81,
    F10 = 82,
    F11 = 83,
    F12 = 84,
    F13 = 85,
    F14 = 86,
    F15 = 87,
    F16 = 88,
    F17 = 89,
    F18 = 90,
    F19 = 91,

    NumLock = 92,
    ScrollLock = 93,

    US_QUOTE = 94,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     */
    OEM_8 = 95,
    /**
     * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
     */
    OEM_102 = 96,

    NUMPAD_0 = 97, // VK_NUMPAD0, 0x60, Numeric keypad 0 key
    NUMPAD_1 = 98, // VK_NUMPAD1, 0x61, Numeric keypad 1 key
    NUMPAD_2 = 99, // VK_NUMPAD2, 0x62, Numeric keypad 2 key
    NUMPAD_3 = 100, // VK_NUMPAD3, 0x63, Numeric keypad 3 key
    NUMPAD_4 = 101, // VK_NUMPAD4, 0x64, Numeric keypad 4 key
    NUMPAD_5 = 102, // VK_NUMPAD5, 0x65, Numeric keypad 5 key
    NUMPAD_6 = 103, // VK_NUMPAD6, 0x66, Numeric keypad 6 key
    NUMPAD_7 = 104, // VK_NUMPAD7, 0x67, Numeric keypad 7 key
    NUMPAD_8 = 105, // VK_NUMPAD8, 0x68, Numeric keypad 8 key
    NUMPAD_9 = 106, // VK_NUMPAD9, 0x69, Numeric keypad 9 key

    NUMPAD_MULTIPLY = 107,	// VK_MULTIPLY, 0x6A, Multiply key
    NUMPAD_ADD = 108,		// VK_ADD, 0x6B, Add key
    NUMPAD_SEPARATOR = 109,	// VK_SEPARATOR, 0x6C, Separator key
    NUMPAD_SUBTRACT = 110,	// VK_SUBTRACT, 0x6D, Subtract key
    NUMPAD_DECIMAL = 111,	// VK_DECIMAL, 0x6E, Decimal key
    NUMPAD_DIVIDE = 112,	// VK_DIVIDE, 0x6F,

    /**
     * Cover all key codes when IME is processing input.
     */
    KEY_IN_COMPOSITION = 113,

    ABNT_C1 = 114, // Brazilian (ABNT) Keyboard
    ABNT_C2 = 115, // Brazilian (ABNT) Keyboard
}
