import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  setProfile: async (profile: any) => {
    await AsyncStorage.setItem('profile', JSON.stringify(profile));
  },
  
  getProfile: async () => {
    const data = await AsyncStorage.getItem('profile');
    return data ? JSON.parse(data) : null;
  },
  
  setPathway: async (key: string, data: any) => {
    await AsyncStorage.setItem(`pathway_${key}`, JSON.stringify(data));
  },
  
  getPathway: async (key: string) => {
    const data = await AsyncStorage.getItem(`pathway_${key}`);
    return data ? JSON.parse(data) : null;
  },
  
  setTasks: async (tasks: any[]) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  },
  
  getTasks: async () => {
    const data = await AsyncStorage.getItem('tasks');
    return data ? JSON.parse(data) : [];
  },
};
