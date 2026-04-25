export const API_ENDPOINTS = {
    // AUTH
    GET_USER_DETAILS: '/vendor/getUserDetails',

    // PORTFOLIO
    GET_HOLDINGS: '/portfolio/holdings',
    GET_POSITIONS: '/portfolio/positions',
    CLOSE_OPEN_POSITION: '/orders/positions/sqroff',
    CONVERSION: '/portfolio/conversion',

    // ORDERS
    PLACE_ORDER: '/orders/placeorder',
    ORDER_BOOK: '/orders/book',
    ORDER_HISTORY: '/orders/history',
    MODIFY_ORDER: '/orders/modify',
    CANCEL_ORDER: '/orders/cancel',
    TRADE_BOOK: '/orders/trades',

    // MARGIN
    CHECK_MARGIN: '/orders/checkMargin',
    BASKET_MARGIN: '/orders/basket/margin',

    // EXIT
    EXIT_SNO: '/orders/exit/sno',

    //FUNDS
    GET_AVAILABLE_FUND: '/limits'
};