/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState, useRef } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Button,
  useWindowDimensions,
  Image,
  TextInput
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import {Camera, useCameraDevices} from "react-native-vision-camera";

import ImageResizer from '@bam.tech/react-native-image-resizer';
import ReactNativeBlobUtil, { ReactNativeBlobUtilFile } from 'react-native-blob-util';


function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [res,setResp] = useState("");
  const camera = useRef<Camera>(null);
  const [photoTaken,setPhotoTaken] = useState(false);
  const [photo, setPhoto] = useState<any>(null);
  const [text,setText] = useState("");

  useEffect(() => {
    fetch("http://172.17.29.82:3000").then(r => r.text()).then(res => {
      setResp(res);
    });

    const checkGetPerms = async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      console.log("cameraaaa", cameraPermission);
      if(cameraPermission == "not-determined"){
        const cameraPermission = await Camera.getCameraPermissionStatus();
      }
    };

    checkGetPerms();

    return () => {};

  }, []);

  const devices = useCameraDevices("wide-angle-camera");
  let device;
  if(devices){
    device = devices.back;
    console.log("camera thereeeeee");
  }

  const {height, width} = useWindowDimensions();

  const takePhoto = async () => {
    const photo = await camera.current?.takePhoto();
    if(photo){
      console.log(photo.width,photo.height,photo.path);
      ImageResizer.createResizedImage(
        photo.path,
        768,
        768,
        "JPEG",
        100,
        90,
        undefined,
        undefined,
        {
          mode: "cover",
          onlyScaleDown: true
        }
      ).then((response) => {
          console.log(response);
          setPhoto(response);
          setPhotoTaken(true);
  
        })
        .catch((err) => {
          console.log(err);
          // Oops, something went wrong. Check that the filename is correct and
          // inspect err to get more details.
        });

    }
  }

  const genImage = async () => {
    let key = "49d4612795f75352cd4a7c51f46f43ae2f4b73d6c67947d39e7503fc3b7c0827b1539d267493ca0473f0a4bfc34c9336";


    // const form = new FormData()
    // form.append('image_file', ReactNativeBlobUtil.wrap(photo.path))
    // form.append('prompt', 'met gala with lots of people')

    // fetch('https://clipdrop-api.co/replace-background/v1', {
    //   method: 'POST',
    //   headers: {
    //     'x-api-key': key,
    //   },
    //   body: form,
    // })
    //   .then(response => {
    //     console.log(response.status);
    //     return response.arrayBuffer()
    //   })
    //   .then(buffer => {

    //   });

    
  }

  if(photo && photo.path){
    
    return (<>
      <View style={{
        height: height,
        width: width,
        
      }}>
        <Image
          style={{
            position: "absolute",
            left: width/2 - 150,
            top: 80
          }}
          source={{uri: `file://${photo.path}`,width: 300, height: (300) * 16/9}}
        />
        <TextInput
          style={{
            width: width * 0.9,
            height: 40,
            margin: width * 0.05,
            borderWidth: 1,
            padding: 10,
            position: "absolute",
            
          }}
          onChangeText={(text) => {
            setText(text);
          }}
          value={text}
          placeholder="Enter prompt"
        />
        <View
         style={{
          position: "absolute",
          bottom: 50,
          width: 200,
          margin: width/2 - 100
        }}
        >
        <Button
          onPress={() => {
            genImage();
          }}
          title="Generate image"
          color="blue"
         
        />
        </View>
      </View>
    </>);
  }

  return (
       <> 
        {
            device
              ? <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
                ref={camera}
              />
              : <></>
          }
          <View style={{
            position: "absolute",
            bottom: 100,
            left: width / 2 - 75,
            width: 150,
            borderRadius: 50
          }}>
            <Button
              onPress={() => {
                takePhoto();
              }}
              title="Take a pic"
              color="blue"
            />
          </View>
      </>
   
  );
}


export default App;
