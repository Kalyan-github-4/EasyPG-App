import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { House, CompassIcon, Heart, User, List, ChatCircleDots, PlusCircle } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppAuth } from "@/src/context/auth-context";

function TabIcon({
  icon,
  focused,
}: {
  icon: React.ReactNode;
  focused: boolean;
}) {
  return (
    <View className="flex items-center justify-center">
      {icon}
    </View>
  );
}

export default function TabLayout() {
  const { dbUser } = useAppAuth();
  const isHost = dbUser?.role === "host";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        lazy: true,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 2,
          ...Platform.select({ android: { elevation: 8 } }),
        },
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={<House size={22} color={color} weight={focused ? "fill" : "regular"} />}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          href: isHost ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={<CompassIcon size={22} color={color} weight={focused ? "bold" : "regular"} />}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: isHost ? "Listings" : "Saved",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={
                isHost
                  ? <List size={22} color={color} weight={focused ? "bold" : "regular"} />
                  : <Heart size={22} color={color} weight={focused ? "fill" : "regular"} />
              }
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-property"
        options={{
          title: "Add Property",
          href: null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={<PlusCircle size={24} color={color} weight={focused ? "fill" : "regular"} />}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          href: isHost ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={<ChatCircleDots size={22} color={color} weight={focused ? "fill" : "regular"} />}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={<User size={22} color={color} weight={focused ? "fill" : "regular"} />}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}