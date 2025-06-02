import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import usersService from "./usersService.js";

const initialState = {
  users: [],
  total: 0,
  isError: false,
  isSuccess: false,
  isBlockUnblockSuccess: false,
  isLoading: false,
  message: "",
};

export const getAllUsers = createAsyncThunk(
  "adminUsers/getAll",

  async ({ page, search }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo?.accessToken;

      if (!token) {
        throw new Error("No admin token found");
      }
      return await usersService.getAllUsers(token, page, search);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const blockUser = createAsyncThunk(
  "adminUsers/block",
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo?.accessToken;
      if (!token) {
        throw new Error("No admin token found");
      }
      return await usersService.blockUser(token, userId);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const unblockUser = createAsyncThunk(
  "adminUsers/unblock",
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().adminAuth.adminInfo?.accessToken;
      if (!token) {
        throw new Error("No admin token found");
      }
      return await usersService.unblockUser(token, userId);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const usersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isBlockUnblockSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.users;
        state.total = action.payload.total;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(blockUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isBlockUnblockSuccess = true;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(unblockUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isBlockUnblockSuccess = true;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = usersSlice.actions;
export default usersSlice.reducer;
