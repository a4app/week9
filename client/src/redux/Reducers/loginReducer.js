let initialState = {
    buttonLoading: false,
};

const loginReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_LOADING': return {
            ...state,
            buttonLoading: action.payload,
        }
        default:
            return state;
    }
};

export default loginReducer;