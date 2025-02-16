import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import config from "../../config";
import { CountryPicker } from "react-native-country-codes-picker";
import AppTextInput from "../../components/AppTextInput";
import AppButton from "../../components/AppButton";
import { useDispatch, useSelector } from "react-redux";
import { launchImageLibrary } from "react-native-image-picker";
import { GuideSignupReducer, UserSignupReducer } from "../../redux/reducers";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";
import { SagaActions } from "../../redux/sagas/SagaActions";
import moment from "moment";
import DeviceInfo from "react-native-device-info";

const GuideSignupScreen = ({ navigation, route }) => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const userSignupResponse = useSelector(
    UserSignupReducer.selectUserSignupData
  );
  const userSignupErrorResponse = useSelector(
    UserSignupReducer.selectUserSignupResponse
  );
  const [firstName, setFirstName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [country, setCountry] = useState("");
  const [date_of_birth, setDate_of_birth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showCountryCode, setShowCountryCode] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [countryFlag, setCountryFlag] = useState("");
  const [countryCodeModal, setCountryCodeModal] = useState(false);
  const [filePath, setFilePath] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocused1, setIsFocused1] = useState(false);
  const [test1, setTest1] = useState("");
  const [test2, setTest2] = useState("");
  const [test3, setTest3] = useState("");
  const [test4, setTest4] = useState("");
  const [test5, setTest5] = useState("");
  const [test6, setTest6] = useState("");
  const [filePathArray, setFilePathArray] = useState([]);

  console.log("filePath", filePath);
  // hooks call
  useEffect(() => {
    if (userSignupResponse != null) {
      if (userSignupResponse?.error == false) {
        console.log("userSignupResponse", (userSignupResponse));
        Toast.show({
          type: "custom",
          text1: userSignupResponse?.message,
        });
        navigation.navigate(config.routes.GUIDE_OTP_VERIFICATION, {
          mobileNo: mobileNumber,
          code: countryCode,
          otp: userSignupResponse?.results?.otp,
          from: "signup",
        });
        // navigation.navigate(config.routes.ACCOUNT_SUCCESS, {
        //   token: userSignupResponse?.results?.token,
        //   userData: userSignupResponse?.results?.users,
        // });
        dispatch(UserSignupReducer.removeUserSignupResponse());
      }
    }
  }, [userSignupResponse]);

  useEffect(() => {
    if (userSignupErrorResponse != null) {
      if (userSignupErrorResponse?.error != "") {
        Toast.show({
          type: "custom",
          text1: userSignupErrorResponse?.message,
        });
        dispatch(UserSignupReducer.removeUserSignupResponse());
      }
    }
  }, [userSignupErrorResponse]);

  useEffect(() => {
    getDeviceInfo();
  }, []);

  //function call
  const validatePassword = (val) => {
    let result1 = /[a-z]/.test(val) && /[A-Z]/.test(val);
    let result2 = /\d/.test(val) && /[!@#$%^&*(),.?":{}|<>]/.test(val);
    let result3 = val.length >= 8;
    setTest1(result1);
    setTest2(result2);
    setTest3(result3);
  };
  const validateConfirmPassword = (val) => {
    let result1 = /[a-z]/.test(val) && /[A-Z]/.test(val);
    let result2 = /\d/.test(val) && /[!@#$%^&*(),.?":{}|<>]/.test(val);
    let result3 = val.length >= 8;
    setTest4(result1);
    setTest5(result2);
    setTest6(result3);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  //date calculate
  const eighteenYearsAgo = moment().subtract(18, 'years').subtract(1, 'days').toDate();
  

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    const validDate = dateValidate(date);
    if (!validDate) {
      setDatePickerVisibility(false);
    } else {
      setDate_of_birth(moment(date).format("YYYY-MM-DD"));
      setDatePickerVisibility(false);
    }
  };

  const getDeviceInfo = async () => {
    const deviceId = await DeviceInfo.getUniqueId();
    setDeviceId(deviceId);
    console.log("Device ID:", deviceId, "type", typeof deviceId);
  };

  const dateValidate = (dateString) => {
    const today = new Date();
    const inputDate = new Date(dateString);

    // Calculate 18 years ago from today
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    // Check if the input date is before 18 years ago
    return inputDate <= eighteenYearsAgo;
  };

  const selectImage = () => {
    const options = {
      selectionLimit: 0,
      mediaType: "mixed",
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else {
        const imgArray = response.assets.map((item) => ({
          uri: item.uri,
          type: item.type,
          name: item.fileName,
        }));

        // setFilePathArray(prevState => [...prevState, ...imgArray]);
        setFilePathArray(imgArray);
        console.log("imgArray", imgArray);
        console.log("filePathArray", filePathArray);
      }
    });
  };

  // api call

  const callGuideSignupApi = () => {
    const validDate = dateValidate(date_of_birth);
    var emailRegex = /^([a-z0-9_\-\.])+\@([a-z0-9_\-\.])+\.([a-z]{2,4})$/;
    var passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/;
    const matchPassword = passwordRegex.test(password);
    const matchConfirmPassword = passwordRegex.test(confirmPassword);
    const result = emailRegex.test(email);
    console.log("result", result);

    if (firstName == "") {
      return Toast.show({
        type: "custom",
        text1: "Please enter full name",
      });
    }

    if (mobileNumber == "") {
      return Toast.show({
        type: "custom",
        text1: "Please enter mobile number ",
      });
    }

    if (email == "") {
      return Toast.show({
        type: "custom",
        text1: "Please enter your email id first   ",
      });
    }

    if (result == false) {
      return Toast.show({
        type: "custom",
        text1: "Please enter valid email ",
      });
    }

    if (date_of_birth == "") {
      return Toast.show({
        type: "custom",
        text1: "Please enter DOB   ",
      });
    }

    if (!validDate) {
      return Toast.show({
        type: "custom",
        text1: "Your age should be more then 18",
      });
    }

    // if (country == '') {
    //   return Toast.show({
    //     type: 'custom',
    //     text1: 'Please enter country name ',
    //   });
    // }

    // if (countryCode == '') {
    //   return Toast.show({
    //     type: 'custom',
    //     text1: 'Please select country code  ',
    //   });
    // }

   

    if (password == "") {
      return Toast.show({
        type: "custom",
        text1: "Please enter password   ",
      });
    }
    if (matchPassword == false) {
      return Toast.show({
        type: "custom",
        text1: "Please enter valid password   ",
      });
    }

    if (confirmPassword == "") {
      return Toast.show({
        type: "custom",
        text1: "Please enter confirm password   ",
      });
    }
    if (matchConfirmPassword == false) {
      return Toast.show({
        type: "custom",
        text1: "Please enter valid confirm password   ",
      });
    }

    if (confirmPassword != password) {
      return Toast.show({
        type: "custom",
        text1: `Password and confirm password should be match`,
      });
    }

    if (!toggle) {
      return Toast.show({
        type: "custom",
        text1: "Please agree terms of service & privacy policy to continue",
      });
    }

    const payload = {
      fullName: firstName,
      email: email,
      countryCode: "+966",
      countryName: "Saudi Arabia",
      mobileNumber: mobileNumber.replace(/\s/g, ""),
      dob: date_of_birth,
      language: "English",
      password: password,
      tripMemories: filePathArray,
      fcmToken: "test123",
      deviceOS: Platform.OS,
      deviceId: deviceId,
      type: "local",
    };
    dispatch({ type: SagaActions.USER_SIGN_UP, payload });
  };

  const CountryCodeModal = () => {
    return (
      <CountryPicker
        onRequestClose={() => {
          setShowCountryCode(!showCountryCode);
        }}
        style={{
          modal: {
            height: config.constants.Height / 2.5,
          },
        }}
        show={showCountryCode}
        // when picker button press you will get the country object with dial code
        pickerButtonOnPress={(item) => {
          setCountryCode(item.dial_code);
          setCountry(item?.name?.en);
          setCountryFlag(item?.flag);
          console.log("code", item);
          setShowCountryCode(false);
        }}
      />
    );
  };

  const showCountryCodeModal = () => {
    return (
      <CountryPicker
        onRequestClose={() => {
          setShowCountryCode(!showCountryCode);
        }}
        style={{
          modal: {
            height: config.constants.Height / 2.5,
          },
        }}
        show={countryCodeModal}
        // when picker button press you will get the country object with dial code
        pickerButtonOnPress={(item) => {
          // setCountryCode(item.dial_code);
          setCountry(item?.name?.en);
          // setCountryFlag(item?.flag);
          console.log("code", item);
          setCountryCodeModal(false);
        }}
      />
    );
  };

  const DatePickerModal = () => {
    return (
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        maximumDate={eighteenYearsAgo} // Set the maximum date
        onCancel={() => {
          setDatePickerVisibility(false);
        }}
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: config.colors.white,
      }}
    >
      <StatusBar
        barStyle={"dark-content"}
        backgroundColor={config.colors.white}
      />

      <Text
        style={{
          fontFamily: config.fonts.HeadingFont,
          fontSize: 34,
          lineHeight: 38,
          textAlign: "center",
          marginTop: 25,
          color: config.colors.blackColor,
        }}
      >{`Create Account`}</Text>

      <ScrollView
        contentContainerStyle={{ marginHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: config.fonts.PrimaryFont,
            fontSize: 18,
            lineHeight: 28,
            textAlign: "center",
            color: config.colors.blackColor,
          }}
        >{`Fill all the details to create your \naccount.`}</Text>

        <View style={styles.inputCss1}>
          <AppTextInput
            placeholder="Full Name"
            keyboardType={"default"}
            onChangeText={(val) => setFirstName(val.replace(/[^a-zA-Z ]/g, ""))}
            value={firstName}
            leftIconStyle={{
              height: 20,
              width: 20,
              resizeMode: "contain",
            }}
            leftIcon={config.images.USER_ICON}
          />
        </View>

        <View
          style={{
            marginTop: 12,
          }}
        >
          <View
            style={{
              padding: 8, // Also used to make it look nicer
              zIndex: 0,
              flexDirection: "row",
              height: 52,
              borderRadius: 4,
              alignItems: "center",
              marginVertical: 5,
              borderColor: config.colors.lightGreyColor,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}
          >
            <TouchableOpacity
              style={{ paddingHorizontal: 9, flexDirection: "row" }}
              onPress={() => {
                setShowCountryCode(true);
              }}
            >
              <Text
                style={{
                  fontFamily: config.fonts.MediumFont,
                  fontSize: 14,
                  lineHeight: 16,
                  color: config.colors.lightGrey2Color,
                }}
              >
                {"🇸🇦"}
              </Text>
              <Text
                style={{
                  marginHorizontal: 6,
                  fontFamily: config.fonts.MediumFont,
                  fontSize: 14,
                  lineHeight: 16,
                  color: config.colors.LatoRegularFont,
                }}
              >
                {"+966 "}
              </Text>
              {/* <Image
                source={config.images.RIGHT_ARROW}
                style={{
                  height: 20,
                  width: 20,
                  resizeMode: 'contain',
                  tintColor: config.colors.lightGrey2Color,
                  transform: [{rotate: '90deg'}],
                }} 
              />*/}
            </TouchableOpacity>
            <View style={{ width: "60%" }}>
              <TextInput
                style={{
                  height: 52,
                  width: "90%",
                  fontSize: 14,
                  color: config.colors.blackColor,
                  fontFamily: config.fonts.LatoRegularFont,
                }}
                placeholder="Mobile Number"
                placeholderTextColor={config.colors.lightGrey2Color}
                keyboardType="numeric"
                maxLength={9}
                returnKeyType="done"
                value={mobileNumber}
                onChangeText={(val) => setMobileNumber(val)}
              />
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
          }}
        >
          <AppTextInput
            placeholder="Email address"
            keyboardType={"default"}
            onChangeText={(val) => setEmail(val)}
            value={email}
            leftIconStyle={{
              height: 20,
              width: 20,
              tintColor: config.colors.lightGrey2Color,
              resizeMode: "contain",
            }}
            leftIcon={config.images.EMAIL_ICON}
          />
        </View>

        <View
          style={{
            marginTop: 12,
            height: 52,
            borderRadius: 4,
            borderColor: config.colors.lightGreyColor,
            borderWidth: 1,
            justifyContent: "center",
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              showDatePicker();
              // setShow(true)
            }}
          >
            <View style={{ width: "12%" }}>
              <Image
                source={config.images.CALENDAR_ICON}
                style={{
                  width: 16,
                  height: 16,
                  tintColor: config.colors.lightGrey2Color,
                  resizeMode: "contain",
                  marginHorizontal: 7,
                }}
              />
            </View>
            <Text
              style={{
                fontFamily: config.fonts.MediumFont,
                fontSize: 14,
                lineHeight: 19,
                color: config.colors.lightGrey2Color,
              }}
            >{`${date_of_birth ? date_of_birth : "Date of Birth"}`}</Text>
          </TouchableOpacity>
        </View>
        {/* <Text
          style={{
            fontFamily: config.fonts.primaryColor,
            fontSize: 12,
            lineHeight: 16,
            color: config.colors.red,
          }}>{`Your age should be more then 18`}</Text> */}

        <View
          style={{
            marginTop: 12,
            padding: 8, // Also used to make it look nicer
            zIndex: 0,
            flexDirection: "row",
            height: 52,
            borderRadius: 4,
            alignItems: "center",
            marginVertical: 5,
            borderColor: config.colors.lightGreyColor,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <View
            style={{
              // width:'10%'
              marginHorizontal: 7,
            }}
          >
            <Image
              source={config.images.COUNTRY_ICON}
              style={{
                height: 18,
                width: 18,
                resizeMode: "contain",
              }}
            />
          </View>
          <View
            style={{
              width: "80%",
            }}
          >
            <Text
              style={{
                marginLeft: 7,
                lineHeight: 18,
                fontSize: 14,
                color: config.colors.blackColor,
                fontFamily: config.fonts.MediumFont,
              }}
            >{`Saudi Arabia`}</Text>
            {/* <TextInput
              style={{
                height: 52,
                // width: '70%',
                lineHeight: 18,
                fontSize: 14,
                color: config.colors.blackColor,
                fontFamily: config.fonts.MediumFont,
              }}
              editable={false}
              placeholderTextColor={config.colors.lightGrey2Color}
              value={country}
              keyboardType={'default'}
              placeholder="Country"
            /> */}
          </View>
          {/* <TouchableOpacity
            style={{
              width: '10%',
            }}
            onPress={() => {
              setShowCountryCode(true);
            }}>
            <Image
              source={config.images.RIGHT_ARROW}
              style={{
                height: 18,
                width: 18,
                resizeMode: 'contain',
                tintColor: config.colors.lightGrey2Color,
                transform: [{rotate: '90deg'}],
              }}
            />
          </TouchableOpacity> */}
        </View>

        <View
          style={{
            marginTop: 12,
            padding: 8, // Also used to make it look nicer
            zIndex: 0,
            flexDirection: "row",
            height: 52,
            borderRadius: 4,
            alignItems: "center",
            marginVertical: 5,
            borderColor: config.colors.lightGreyColor,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <View
            style={{
              // width:'10%'
              marginHorizontal: 7,
            }}
          >
            <Image
              source={config.images.LOCK_ICON}
              style={{
                height: 20,
                width: 20,
                resizeMode: "contain",
              }}
            />
          </View>
          <View
            style={{
              width: "80%",
            }}
          >
            <TextInput
              ref={inputRef}
              style={{
                height: 52,
                // width: '70%',
                lineHeight: 18,
                fontSize: 14,
                color: config.colors.blackColor,
                fontFamily: config.fonts.MediumFont,
              }}
              placeholderTextColor={config.colors.lightGrey2Color}
              onChangeText={(val) => {
                setPassword(val.replace(/[^0-9a-zA-Z!@#$%^&*()]/g, ""));
                validatePassword(val);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={password}
              secureTextEntry={showPassword}
              keyboardType={"default"}
              placeholder="Password"
              maxLength={16}
            />
          </View>
          <TouchableOpacity
            style={{
              width: "10%",
            }}
            onPress={() => {
              setShowPassword(!showPassword);
            }}
          >
            <Image
              source={
                showPassword
                  ? config.images.CLOSE_EYE_ICON
                  : config.images.EYE_ICON
              }
              style={{
                height: 20,
                width: 20,
                tintColor: config.colors.lightGrey2Color,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
        </View>
        {isFocused && (
          <View
            style={{
              // height: 100,
              paddingVertical: 12,
              paddingHorizontal: 8,
              paddingVertical: 6,
              width: "100%",
              borderWidth: 1,
              borderRadius: 12,
              borderColor:
                test1 && test2 && test3
                  ? config.colors.greenColor
                  : config.colors.red,
            }}
          >
            <Text
              style={{
                marginTop: 7,
                fontFamily: config.fonts.MediumFont,
                fontSize: 17,
                lineHeight: 21,
                color: config.colors.blackColor,
              }}
            >{`Your password needs to:`}</Text>
            <Text
              style={{
                fontFamily: config.fonts.PrimaryFont,
                fontSize: 14,
                lineHeight: 18,
                color: test1 ? config.colors.greenColor : config.colors.red,
              }}
            >
              {test1 ? "✔" : "X"}{" "}
              {` include both lower and upper case characters.`}
            </Text>
            <Text
              style={{
                fontFamily: config.fonts.PrimaryFont,
                fontSize: 14,
                lineHeight: 18,
                color: test2 ? config.colors.greenColor : config.colors.red,
              }}
            >
              {test2 ? "✔" : "X"}
              {` include at least one number or symbol.`}
            </Text>
            <Text
              style={{
                fontFamily: config.fonts.PrimaryFont,
                fontSize: 14,
                lineHeight: 18,
                color: test3 ? config.colors.greenColor : config.colors.red,
              }}
            >
              {test3 ? "✔" : "X"}
              {` be at least 8 characters long.`}
            </Text>
          </View>
        )}

        <View
          style={{
            marginTop: 12,
            padding: 8, // Also used to make it look nicer
            zIndex: 0,
            flexDirection: "row",
            height: 52,
            borderRadius: 4,
            alignItems: "center",
            marginVertical: 5,
            borderColor: config.colors.lightGreyColor,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <View
            style={{
              // width:'10%'
              marginHorizontal: 7,
            }}
          >
            <Image
              source={config.images.LOCK_ICON}
              style={{
                height: 20,
                width: 20,
                resizeMode: "contain",
              }}
            />
          </View>
          <View
            style={{
              width: "80%",
            }}
          >
            <TextInput
              style={{
                height: 52,
                // width: '70%',
                lineHeight: 18,
                fontSize: 14,
                color: config.colors.blackColor,
                fontFamily: config.fonts.MediumFont,
              }}
              placeholderTextColor={config.colors.lightGrey2Color}
              onChangeText={(val) => {
                setConfirmPassword(val.replace(/[^0-9a-zA-Z!@#$%^&*()]/g, ""));
                validateConfirmPassword(val);
              }}
              onFocus={() => setIsFocused1(true)}
              onBlur={() => setIsFocused1(false)}
              value={confirmPassword}
              secureTextEntry={showConfirmPassword}
              keyboardType={"default"}
              placeholder="Confirm Password"
              maxLength={16}
            />
          </View>
          <TouchableOpacity
            style={{
              width: "10%",
            }}
            onPress={() => {
              setShowConfirmPassword(!showConfirmPassword);
            }}
          >
            <Image
              source={
                showConfirmPassword
                  ? config.images.CLOSE_EYE_ICON
                  : config.images.EYE_ICON
              }
              style={{
                height: 20,
                width: 20,
                tintColor: config.colors.lightGrey2Color,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
        </View>
        {isFocused1 && (
          <View
            style={{
              // height: 100,
              paddingVertical: 12,
              paddingHorizontal: 8,
              paddingVertical: 6,
              width: "100%",
              borderWidth: 1,
              borderRadius: 12,
              borderColor:
                test4 && test5 && test6
                  ? config.colors.greenColor
                  : config.colors.red,
            }}
          >
            <Text
              style={{
                marginTop: 7,
                fontFamily: config.fonts.MediumFont,
                fontSize: 17,
                lineHeight: 21,
                color: config.colors.blackColor,
              }}
            >{`Your password needs to:`}</Text>
            <Text
              style={{
                fontFamily: config.fonts.PrimaryFont,
                fontSize: 14,
                lineHeight: 18,
                color: test4 ? config.colors.greenColor : config.colors.red,
              }}
            >
              {test4 ? "✔" : "X"}{" "}
              {` include both lower and upper case characters.`}
            </Text>
            <Text
              style={{
                fontFamily: config.fonts.PrimaryFont,
                fontSize: 14,
                lineHeight: 18,
                color: test5 ? config.colors.greenColor : config.colors.red,
              }}
            >
              {test5 ? "✔" : "X"}
              {` include at least one number or symbol.`}
            </Text>
            <Text
              style={{
                fontFamily: config.fonts.PrimaryFont,
                fontSize: 14,
                lineHeight: 18,
                color: test6 ? config.colors.greenColor : config.colors.red,
              }}
            >
              {test6 ? "✔" : "X"}
              {` be at least 8 characters long.`}
            </Text>
          </View>
        )}

        <Text
          style={{
            marginTop: 12,
            fontFamily: config.fonts.MediumFont,
            fontSize: 14,
            color: config.colors.blackColor,
          }}
        >{`Optional`}</Text>
        <View
          style={{
            height: 80,
            marginTop: 12,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: config.colors.greyColor,
            borderStyle: "dashed",
          }}
        >
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              selectImage();
            }}
          >
            <Image
              source={config.images.CAMERA_ICON}
              style={{ height: 20, width: 20, resizeMode: "contain" }}
            />
            <Text
              style={{
                fontFamily: config.fonts.PrimaryFont,
                fontSize: 12,
                lineHeight: 14,
                color: config.colors.greyColor,
              }}
            >
              {filePathArray?.length != 0
                ? `Image /video uploaded ${filePathArray?.length}`
                : `Upload trip memories (min. 2)`}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 20,
            width: "100%",
            alignItems: "center",
            marginVertical: 20,
            flexDirection: "row",
            alignItems: "center",
            // justifyContent:'space-between'
          }}
        >
          <TouchableOpacity
            style={{
              height: 23,
              width: 23,
              resizeMode: "contain",
            }}
            onPress={() => setToggle(!toggle)}
          >
            <Image
              source={
                toggle ? config.images.CHECK_ICON : config.images.UNCHECK_ICON
              }
              style={{
                marginTop: 2,
                height: toggle ? 23 : 21,
                width: toggle ? 23 : 21,
                resizeMode: "contain",
                marginRight: 6,
              }}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: config.fonts.PrimaryFont,
              fontSize: 12,
              lineHeight: 19,
              color: config.colors.lightGrey2Color,
            }}
          >
            {`  I Agree to the  `}
          </Text>

          <Text
            style={{
              textDecorationLine: "underline",
              textDecorationColor: config.colors.primaryColor,
              fontFamily: config.fonts.HeadingFont,
              fontSize: 12,
              lineHeight: 19,
              color: config.colors.primaryColor,
            }}
          >
            {`Terms of Service`}
          </Text>

          <Text
            style={{
              textDecorationLine: "none",
              textDecorationColor: config.colors.white,
              fontFamily: config.fonts.PrimaryFont,
              fontSize: 12,
              lineHeight: 19,
              color: config.colors.lightGrey2Color,
            }}
          >
            {`  &  `}
          </Text>

          <Text
            style={{
              textDecorationLine: "underline",
              textDecorationColor: config.colors.primaryColor,
              fontFamily: config.fonts.HeadingFont,
              fontSize: 12,
              lineHeight: 19,
              color: config.colors.primaryColor,
            }}
          >{`Privacy Policy`}</Text>
        </View>
        <AppButton
          text={"Get Started"}
          onPress={() => {
            callGuideSignupApi();
          }}
          buttonStyle={{ marginVertical: 30 }}
        />
        <View
          style={{
            height: 40,
            marginHorizontal: 40,
            justifyContent: "flex-end",
            alignItems: "center",
            borderBottomWidth: 0.5,
            borderColor: config.colors.lightGrey2Color,
          }}
        >
          <Text
            style={{
              top: 8,
              shadowColor: config.colors.white,
              backgroundColor: config.colors.white,
              fontFamily: config.fonts.primaryColor,
              fontSize: 14,
              lineHeight: 16,
              color: config.colors.lightGrey2Color,
            }}
          >{`   Or   `}</Text>
        </View>

        <View
          style={{
            marginVertical: 30,
            flexDirection: "row",
            justifyContent: "space-between",
            alignSelf: "center",
            width: "35%",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Toast.show({
                type: "custom",
                text1: "Coming Soon",
              });
            }}
          >
            <Image
              source={config.images.APPLE_LOGO}
              style={{ height: 40, width: 40, resizeMode: "contain" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Toast.show({
                type: "custom",
                text1: "Coming Soon",
              });
            }}
          >
            <Image
              source={config.images.GOOGLE_ICON}
              style={{ height: 40, width: 40, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      {CountryCodeModal()}
      {showCountryCodeModal()}
      {DatePickerModal()}
    </SafeAreaView>
  );
};

export default GuideSignupScreen;

const styles = StyleSheet.create({
  inputcss: {
    width: "45%",
    marginTop: 10,
    // backgroundColor:'cyan',
  },
  inputCss1: {
    marginTop: 12,
  },
});
