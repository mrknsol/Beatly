import { useEffect, useState } from "react";
import { store } from "@/store";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import * as SecureStore from 'expo-secure-store';
import { restoreToken } from "@/store/authSlice";
import { hydratePlaylists } from "@/store/playlistsSlice";

function NavigationGuard() {
  const [isReady, setIsReady] = useState(false); 
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const hydratedUserId = useSelector((state: RootState) => state.playlists.hydratedUserId);
  const dispatch = useDispatch<AppDispatch>();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userData = await SecureStore.getItemAsync('userData'); 

        if (token && userData) {
          dispatch(restoreToken({ 
            token, 
            user: JSON.parse(userData) 
          }));
        }
      } catch (e) {
        console.log("Error checking token", e);
      } finally {
        setIsReady(true);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const userKey = user.id || user.email;
    if (!userKey || hydratedUserId === userKey) return;
    dispatch(hydratePlaylists(userKey));
  }, [isAuthenticated, user, hydratedUserId, dispatch]);

  useEffect(() => {
    if (!isReady) return; 
  
    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === "(auth)";
    const isAtRoot = rootSegment === undefined; 
  
    if (!isAuthenticated) {
      if (!inAuthGroup && !isAtRoot) {
        router.replace("/(auth)/login");
      }
    } else {
      if (inAuthGroup || isAtRoot) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, segments, isReady]);

  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="playlist" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <NavigationGuard />
    </Provider>
  );
}