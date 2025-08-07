import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
}

const initialState: UIState = {
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isRegisterModalOpen = false;
      state.isLoginModalOpen = true;
    },
    openRegisterModal: (state) => {
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = true;
    },
    closeModals: (state) => {
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
    },
    switchToRegister:(state)=>{
      state.isLoginModalOpen=false;
      state.isRegisterModalOpen=true
    },
    switchToLogin:(state)=>{
      state.isLoginModalOpen=true;
      state.isRegisterModalOpen=false
    }
  },
});

export const { openLoginModal, openRegisterModal, closeModals , switchToLogin,switchToRegister} = uiSlice.actions;
