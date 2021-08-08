export const enum KeyCode {
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
    Enter = 14,
    Escape = 15,

    F1 = 16,
    F2 = 17,
    F3 = 18,
    F4 = 19,
    F5 = 20,
    F6 = 21,
    F7 = 22,
    F8 = 23,
    F9 = 24,
    F10 = 25,
    F11 = 26,
    F12 = 27,

    KEY_A = 41,
    KEY_B = 42,
    KEY_C = 43,
    KEY_D = 44,
    KEY_E = 45,
    KEY_F = 46,
    KEY_G = 47,
    KEY_H = 48,
    KEY_I = 49,
    KEY_J = 50,
    KEY_K = 61,
    KEY_L = 62,
    KEY_M = 63,
    KEY_N = 64,
    KEY_O = 65,
    KEY_P = 66,
    KEY_Q = 67,
    KEY_R = 68,
    KEY_S = 69,
    KEY_T = 70,
    KEY_U = 71,
    KEY_V = 72,
    KEY_W = 73,
    KEY_X = 74,
    KEY_Y = 75,
    KEY_Z = 76,

    /**
     * The key below can be conbined with SHIFT key.
     * key code plus 1 is the key that conbined with SHIFT.
     */

    SHIFT_CONBINED_KEY_START = 85,

    /**
     * For the US standard keyboard, the '0)' key
     */
    KEY_0 = 86,
    KEY_0_SHIFT = 87,
    /**
     * For the US standard keyboard, the '1!' key
     */
    KEY_1 = 88,
    KEY_1_SHIFT = 89,
    /**
     * For the US standard keyboard, the '2@' key
     */
    KEY_2 = 90,
    KEY_2_SHIFT = 91,
    /**
     * For the US standard keyboard, the '3#' key
     */
    KEY_3 = 92,
    KEY_3_SHIFT = 93,
    /**
     * For the US standard keyboard, the '4$' key
     */
    KEY_4 = 94,
    KEY_4 = 95,
    /**
     * For the US standard keyboard, the '5%' key
     */
    KEY_5 = 96,
    KEY_5_SHIFT = 97,
    /**
     * For the US standard keyboard, the '6^' key
     */
    KEY_6 = 98,
    KEY_6_SHIFT = 99,
    /**
     * For the US standard keyboard, the '7&' key
     */
    KEY_7 = 100,
    KEY_7_SHIFT = 101,
    /**
     * For the US standard keyboard, the '8*' key
     */
    KEY_8 = 102,
    KEY_8_SHIFT = 103,
    /**
     * For the US standard keyboard, the '9(' key
     */
    KEY_9 = 104,
    KEY_9_SHIFT = 105,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ';:' key
     */
    US_SEMICOLON = 106,
    US_SEMICOLON_SHIFT = 107,
    /**
     * For any country/region, the '+' key
     * For the US standard keyboard, the '=+' key
     */
    US_EQUAL = 108,
    US_EQUAL_SHIFT = 109,
    /**
     * For any country/region, the ',' key
     * For the US standard keyboard, the ',<' key
     */
    US_COMMA = 110,
    US_COMMA_SHIFT = 111,
    /**
     * For any country/region, the '-' key
     * For the US standard keyboard, the '-_' key
     */
    US_MINUS = 112,
    US_MINUS_SHIFT = 113,
    /**
     * For any country/region, the '.' key
     * For the US standard keyboard, the '.>' key
     */
    US_DOT = 114,
    US_DOT_SHIFT = 115,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '/?' key
     */
    US_SLASH = 116,
    US_SLASH_SHIFT = 117,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '`~' key
     */
    US_BACKTICK = 118,
    US_BACKTICK_SHIFT = 119,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '[{' key
     */
    US_OPEN_SQUARE_BRACKET = 120,
    US_OPEN_SQUARE_BRACKET_SHIFT = 121,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '\|' key
     */
    US_BACKSLASH = 122,
    US_BACKSLASH_SHIFT = 123,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ']}' key
     */
    US_CLOSE_SQUARE_BRACKET = 124,
    US_CLOSE_SQUARE_BRACKET_SHIFT = 125,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ''"' key
     */
    US_QUOTE = 126,
    US_QUOTE_SHIFT = 127,
};
