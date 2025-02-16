import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import config from '../../config';
import AppHeader from '../../components/AppHeader';
import AppTextInput from '../../components/AppTextInput';
import {removeListener} from '@reduxjs/toolkit';
import AppButton from '../../components/AppButton';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import {useDispatch, useSelector} from 'react-redux';
import {UserForgotPasswordReducer} from '../../redux/reducers';
import Toast from 'react-native-toast-message';
import {CountryPicker} from 'react-native-country-codes-picker';
import {SagaActions} from '../../redux/sagas/SagaActions';

const UserForgotPassword = ({navigation}) => {
  const dispatch = useDispatch();
  const forgotPasswordResponse = useSelector(
    UserForgotPasswordReducer.selectUserForgotPasswordData,
  );
  const forgotPasswordErrorResponse = useSelector(
    UserForgotPasswordReducer.selectUserForgotPasswordResponse,
  );
  const [mobileNumber, setMobileNumber] = useState('');
  const [toggle, setToggle] = useState(false);
  const [showCountryCode, setShowCountryCode] = useState(false);
  const [countryCode, setCountryCode] = useState('+966');
  const [countryFlag, setCountryFlag] = useState('');

  //hook call
  useEffect(() => {
    if (forgotPasswordResponse != null) {
      if (forgotPasswordResponse?.error == false) {
        navigation.navigate(config.routes.USER_OTP_VERIFICATION, {
          otp: forgotPasswordResponse?.results?.otp,
          from: 'forgot',
          mobileNo: mobileNumber,
          code: countryCode
        });
        console.log(
          'forgotPasswordResponse',
          JSON.stringify(forgotPasswordResponse),
        );
      }
    }
  }, [forgotPasswordResponse]);

  useEffect(() => {
    if (forgotPasswordErrorResponse != null) {
      if (forgotPasswordErrorResponse?.error != '') {
        Toast.show({
          type: 'custom',
          text1: forgotPasswordErrorResponse?.message,
        });
      }
    }
  }, [forgotPasswordErrorResponse]);

 

  // api call
  const callForgotPasswordApi = () => {
    const fullPhoneNumber = `${countryCode}${mobileNumber}`;
    const parsedPhoneNumber = parsePhoneNumberFromString(fullPhoneNumber);

    if (!(parsedPhoneNumber && parsedPhoneNumber.isValid())) {
      return Toast.show({
        type: 'custom',
        text1: 'Please enter valid mobile number',
      });
    }
    if (mobileNumber == '') {
     return Toast.show({
        type: 'custom',
        text1: 'Please enter registered mobile number',
      });
    }
   
    if (countryCode == '') {
     return Toast.show({
        type: 'custom',
        text1: 'Please select country code',
      });
    }
    const payload = {
      mobileNumber: mobileNumber,
      countryCode: countryCode,
      type: "guest"
    };
    dispatch({type: SagaActions.USER_FORGOT_PASSWORD, payload});
  };

  const CountryCodeModal = () => {
    return (
      <CountryPicker
      onRequestClose={() => {
        setShowCountryCode(!showCountryCode)
      }}
      style={{
        modal: {
          height: config.constants.Height/2.5
        }
      }}
        show={showCountryCode}
        // when picker button press you will get the country object with dial code
        pickerButtonOnPress={item => {
          setCountryCode(item.dial_code);
          setCountryFlag(item?.flag);
          console.log('code', item);
          setShowCountryCode(false);
        }}
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: config.colors.white,
      }}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={config.colors.white}
      />
      <ScrollView
        contentContainerStyle={{marginHorizontal: 20}}
        showsVerticalScrollIndicator={false}>
        <Text
          style={{
            marginTop: 60,
            fontFamily: config.fonts.HeadingFont,
            fontSize: 34,
            lineHeight: 38,
            textAlign: 'center',
            color: config.colors.blackColor,
          }}>{`Forgot Password`}</Text>
        <Text
          style={{
            // marginVertical: 20,
            fontFamily: config.fonts.PrimaryFont,
            fontSize: 18,
            lineHeight: 28,
            textAlign: 'center',
            color: config.colors.blackColor,
          }}>{`Please enter your mobile number`}</Text>

        <View
          style={{
            marginTop: 60,
          }}>
          <View
            style={{
              backgroundColor: 'white',
              alignSelf: 'flex-start',
              paddingHorizontal: 3,
              marginStart: 10,
              zIndex: 1,
              elevation: 1,
              shadowColor: 'white',
              position: 'absolute',
              top: -5,
            }}>
            <Text
              style={{
                fontFamily: config.fonts.MediumFont,
                color: config.colors.blackColor,
                fontSize: 13,
              }}>{`Mobile Phone`}</Text>
          </View>
          <View
            style={{
              padding: 8, // Also used to make it look nicer
              zIndex: 0,
              flexDirection: 'row',
              height: 52,
              borderRadius: 4,
              alignItems: 'center',
              marginVertical: 5,
              borderColor: config.colors.lightGreyColor,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}>
            <TouchableOpacity
              style={{width: '25%', flexDirection: 'row'}}
              onPress={() => {
                setShowCountryCode(true);
              }}>
              <Text
                style={{
                  fontFamily: config.fonts.MediumFont,
                  fontSize: 14,
                  lineHeight: 16,
                  color: config.colors.lightGrey2Color,
                }}>
                {countryFlag ? countryFlag : "🇸🇦"}
              </Text>
              <Text
                style={{
                  marginHorizontal: 6,
                  fontFamily: config.fonts.LatoRegularFont,
                  fontSize: 14,
                  lineHeight: 16,
                  color: config.colors.lightGrey2Color,
                }}>
                {countryCode ? countryCode : '+966'}
              </Text>
              <Image
                source={config.images.RIGHT_ARROW}
                style={{
                  height: 20,
                  width: 20,
                  resizeMode: 'contain',
                  tintColor: config.colors.lightGrey2Color,
                  transform: [{rotate: '90deg'}],
                }}
              />
            </TouchableOpacity>
            <View style={{width: '75%'}}>
              <TextInput
                style={{
                  height: 52,
                  width: '90%',
                  fontSize: 14,
                  color: config.colors.blackColor,
                  fontFamily: config.fonts.LatoRegularFont,
                }}
                placeholder="9999999999"
                placeholderTextColor={config.colors.lightGrey2Color}
                keyboardType="numeric"
                maxLength={16}
                returnKeyType="done"
                value={mobileNumber}
                onChangeText={val => setMobileNumber(val)}
              />
            </View>
          </View>
        </View>

        <AppButton
          text={'Send Code'}
          onPress={() => {
            // navigation.navigate(config.routes.USER_OTP_VERIFICATION, {
            //   // otp: forgotPasswordResponse?.results?.otp,
            //   // from: 'forgot',
            //   mobileNo: mobileNumber,
            //   code: countryCode
            // });
            callForgotPasswordApi();
          }}
          buttonStyle={{marginVertical: 30}}
        />
      </ScrollView>
      {CountryCodeModal()}
    </SafeAreaView>
  );
};

export default UserForgotPassword;

const styles = StyleSheet.create({});
