import { Alert } from 'react-native';
import { takeLatest, call, put, all } from 'redux-saga/effects';
// import { toast } from 'react-toastify';

import api from '~/services/api';
import { signInSuccess, signFailure } from './actions';

export function* signIn({ payload }) {
  try {
    const { email, password } = payload;

    const response = yield call(api.post, 'sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    if (!user.provider) {
      Alert.alert('Login Error.', 'User can not be a provider.');
      // toast.error('User is not a provider.');
      // Acho que deveria ter pois após testar um usuario que nao é
      // provider fica marcando loading no botao
      yield put(signFailure());
      // acima ^
      return;
    }

    api.defaults.headers.Authorization = `Bearer ${token}`;

    yield put(signInSuccess(token, user));

    // history.push('/dashboard');
  } catch (err) {
    Alert.alert('Authentication failed.', 'Login data error, check your data.');

    // toast.error('Authentication failed.', {
    //   position: toast.POSITION.TOP_CENTER,
    // });

    yield put(signFailure());
  }
}

export function* signUp({ payload }) {
  try {
    const { name, email, password } = payload;
    yield call(api.post, 'users', { name, email, password, provider: true });
    // history.push('/');
  } catch (err) {
    Alert.alert('SignUp failed.', 'SignUp data error, check your data.');

    // toast.error('SignUp failed.');
    yield put(signFailure());
  }
}

export function setToken({ payload }) {
  if (!payload) {
    return;
  }
  const { token } = payload.auth;

  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
}

export function signOut() {
  // history.push('/');
}

export default all([
  takeLatest('persist/REHYDRATE', setToken),
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SIGN_UP_REQUEST', signUp),
  takeLatest('@auth/SIGN_OUT', signOut),
]);
