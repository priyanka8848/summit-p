import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { TypeLoginAPIParams, TypeLoginForm } from '../../interfaces/login-params-interface';
import getTokenFromLoginAPI from '../../services/api/auth/get-token-from-login-api';
import sendOTPToUserAPI from '../../services/api/auth/get-otp-api';
import { storeToken } from '../../store/slices/auth/token-login-slice';
import { SelectedFilterLangDataFromStore } from '../../store/slices/general_slices/selected-multilanguage-slice';
import OtpLoginApi from '../../services/api/auth/otp-login-api';
import { useFormikContext } from 'formik';
import { showToast } from '../../components/ToastNotificationNew';

const useLoginHook = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [newValues, setnewValue] = useState<any>('');
  const [ShowAlertMsg, setShowAlertMsg] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<any>('');
  const [isOtpLoginState, setIsOtpLoginState] = useState<boolean>(false);
  const [selectedMultiLangData, setSelectedMultiLangData] = useState<any>();
  const SelectedLangDataFromStore: any = useSelector(SelectedFilterLangDataFromStore);

  let isLoggedIn: any;
  let guestLogin: any;
  if (typeof window !== 'undefined') {
    guestLogin = localStorage.getItem('guest');
    isLoggedIn = localStorage.getItem('isLoggedIn');
  }
  const togglePasswordIcon = (e: React.MouseEvent) => {
    e.preventDefault();
    setPasswordHidden(!passwordHidden);
  };

  const fetchToken = async (values: TypeLoginForm) => {
    const userParams: TypeLoginAPIParams = {
      values: { ...values },
      isGuest: false,
      loginViaOTP: isOtpLoginState === true ? true : false,
      LoginViaGoogle: false,
    };

    const tokenData = await getTokenFromLoginAPI(userParams);
    console.log(tokenData, 'tokenData');
    if (tokenData?.msg === 'success') {
      localStorage.setItem('isLoggedIn', 'true');
      showToast('Incorrect User or Password', 'error');
      dispatch(storeToken(tokenData?.data));
      router.push('/');
    } else {
      showToast('Incorrect User or Password', 'error');
    }
  };

  const onKeydown = (keyEvent: any) => {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
      fetchToken(newValues);
    }
  };
  const handleGetOtp = async (e: any) => {
    let newObj = {
      usr: newValues?.usr,
    };
    e.preventDefault();
    let GetOtpApiRes: any = await sendOTPToUserAPI(newObj);

    if (GetOtpApiRes?.data?.message?.msg === 'success') {
      setShowAlertMsg(true);
      setMessageState(GetOtpApiRes?.data?.message?.msg);
      setIsOtpLoginState(true);
      setTimeout(() => {
        setShowAlertMsg(false);
        setMessageState('');
      }, 1000);
    } else {
      setShowAlertMsg(true);
      setMessageState(GetOtpApiRes?.data?.message?.msg);
      setTimeout(() => {
        setShowAlertMsg(false);
        setMessageState('');
      }, 1500);
    }
  };
  const FormObserver: React.FC = () => {
    const { values }: any = useFormikContext();
    useEffect(() => {
      setnewValue(values);
    }, [values]);
    return null;
  };

  useEffect(() => {
    if (Object.keys(SelectedLangDataFromStore?.selectedLanguageData)?.length > 0) {
      setSelectedMultiLangData(SelectedLangDataFromStore?.selectedLanguageData);
    }
  }, [SelectedLangDataFromStore?.selectedLanguageData]);
  return {
    passwordHidden,
    togglePasswordIcon,
    fetchToken,
    handleGetOtp,
    onKeydown,
    FormObserver,
    guestLogin,
    selectedMultiLangData,
    ShowAlertMsg,
    messageState,
  };
};

export default useLoginHook;
