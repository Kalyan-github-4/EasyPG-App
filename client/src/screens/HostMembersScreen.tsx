import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { getTenantsForProperty } from "@/src/data/mock-tenants";
import MembersHeader from "@/src/components/host-members/MembersHeader";
import MembersStats from "@/src/components/host-members/MembersStats";
import MemberCard from "@/src/components/host-members/MemberCard";
import EmptyMembers from "@/src/components/host-members/EmptyMembers";

export default function HostMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = id ?? "";

  const tenants = useMemo(
    () => getTenantsForProperty(propertyId),
    [propertyId]
  );

  const goToMember = (memberId: string) => {
    router.push(
      `/(app)/host/property/${propertyId}/members/${memberId}` as any
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <MembersHeader
        title="Members"
        subtitle={
          tenants.length === 0
            ? "No tenants yet"
            : `${tenants.length} ${tenants.length === 1 ? "tenant" : "tenants"} in this property`
        }
        onBack={() => router.back()}
      />

      {tenants.length === 0 ? (
        <EmptyMembers />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <MembersStats tenants={tenants} />
          <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 10 }}>
            {tenants.map((t) => (
              <MemberCard
                key={t.id}
                tenant={t}
                onPress={() => goToMember(t.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
