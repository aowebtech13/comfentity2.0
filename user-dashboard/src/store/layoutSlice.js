import { createSlice } from "@reduxjs/toolkit";
import themeConfig from "@/configs/themeConfig";

const initialState = {
  darkMode: themeConfig.layout.darkMode,
  semiDarkMode: themeConfig.layout.semiDarkMode,
  skin: themeConfig.layout.skin,
  contentWidth: themeConfig.layout.contentWidth,
  type: themeConfig.layout.type,
  navBarType: themeConfig.layout.navBarType,
  footerType: themeConfig.layout.footerType,
  isMonochrome: themeConfig.layout.isMonochrome,
  isCollapsed: themeConfig.layout.menu.isCollapsed,
  menuHidden: themeConfig.layout.menu.isHidden,
  mobileMenu: themeConfig.layout.mobileMenu,
  customizer: themeConfig.layout.customizer,
  isRTL: themeConfig.layout.isRTL,
};

export const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    handleDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    handleSemiDarkMode: (state, action) => {
      state.semiDarkMode = action.payload;
    },
    handleSkin: (state, action) => {
      state.skin = action.payload;
    },
    handleContentWidth: (state, action) => {
      state.contentWidth = action.payload;
    },
    handleType: (state, action) => {
      state.type = action.payload;
    },
    handleNavBarType: (state, action) => {
      state.navBarType = action.payload;
    },
    handleFooterType: (state, action) => {
      state.footerType = action.payload;
    },
    handleMonoChrome: (state, action) => {
      state.isMonochrome = action.payload;
    },
    handleSidebarCollapsed: (state, action) => {
      state.isCollapsed = action.payload;
    },
    handleMenuHidden: (state, action) => {
      state.menuHidden = action.payload;
    },
    handleMobileMenu: (state, action) => {
      state.mobileMenu = action.payload;
    },
    handleCustomizer: (state, action) => {
      state.customizer = action.payload;
    },
    handleRtl: (state, action) => {
      state.isRTL = action.payload;
    },
  },
});

export const {
  handleDarkMode,
  handleSemiDarkMode,
  handleSkin,
  handleContentWidth,
  handleType,
  handleNavBarType,
  handleFooterType,
  handleMonoChrome,
  handleSidebarCollapsed,
  handleMenuHidden,
  handleMobileMenu,
  handleCustomizer,
  handleRtl,
} = layoutSlice.actions;

export default layoutSlice.reducer;
