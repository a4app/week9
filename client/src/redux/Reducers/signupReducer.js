let initialState = {
    buttonLoading: false,
};

const signupReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_LOADING': return {
            ...state,
            buttonLoading: action.payload,
        }
        default:
            return state;
    }
};

export default signupReducer;