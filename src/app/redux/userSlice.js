import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null, 
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    }
  },
});

export const { setUser, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;