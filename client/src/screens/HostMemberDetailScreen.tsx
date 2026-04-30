import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  PhoneIcon,
  ChatCircleDotsIcon,
  EnvelopeIcon,
  DoorOpenIcon,
  BedIcon,
  CalendarBlankIcon,
  CurrencyInrIcon,
  UserIcon,
  IdentificationCardIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from "phosphor-react-native";

import { getTenantById } from "@/src/data/mock-tenants";
import MemberHero from "@/src/components/host-members/MemberHero";
import {
  InfoCard,
  InfoRow,
  RowSeparator,
} from "@/src/components/host-members/InfoCard";
import PaymentHistoryRow from "@/src/components/host-members/PaymentHistoryRow";

export default function HostMemberDetailScreen() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const tenant = memberId ? getTenantById(memberId) : undefined;

  if (!tenant) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8FAFC",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
          Tenant not found
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#64748B",
            marginTop: 6,
            textAlign: "center",
          }}
        >
          We couldn&apos;t find this tenant. They may have been removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: "#0F172A",
            paddingHorizontal: 18,
            paddingVertical: 11,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const callTenant = () =>
    Linking.openURL(`tel:${tenant.phone.replace(/\s+/g, "")}`);
  const messageTenant = () =>
    Linking.openURL(`sms:${tenant.phone.replace(/\s+/g, "")}`);
  const emailTenant = tenant.email
    ? () => Linking.openURL(`mailto:${tenant.email}`)
    : undefined;

  const joined = new Date(tenant.joinedOn).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <MemberHero tenant={tenant} onBack={() => router.back()} />

        {/* Quick actions */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 16,
            marginTop: 16,
          }}
        >
          <ActionButton
            Icon={PhoneIcon}
            label="Call"
            onPress={callTenant}
            primary
          />
          <ActionButton
            Icon={ChatCircleDotsIcon}
            label="Message"
            onPress={messageTenant}
          />
        </View>

        {/* Contact */}
        <InfoCard title="Contact">
          <InfoRow
            Icon={PhoneIcon}
            iconColor="#10B981"
            iconBg="#ECFDF5"
            label="Phone"
            value={tenant.phone}
          />
          {tenant.email ? (
            <>
              <RowSeparator />
              <InfoRow
                Icon={EnvelopeIcon}
                iconColor="#2563EB"
                iconBg="#EFF6FF"
                label="Email"
                value={tenant.email}
                meta={
                  emailTenant ? (
                    <TouchableOpacity
                      onPress={emailTenant}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: "#EFF6FF",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#2563EB",
                        }}
                      >
                        Open
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
            </>
          ) : null}
        </InfoCard>

        {/* Stay */}
        <InfoCard title="Stay">
          <InfoRow
            Icon={DoorOpenIcon}
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            label="Room"
            value={tenant.roomNumber}
          />
          <RowSeparator />
          <InfoRow
            Icon={BedIcon}
            iconColor="#0EA5E9"
            iconBg="#ECFEFF"
            label="Bed type"
            value={`${tenant.bedType} sharing`}
          />
          <RowSeparator />
          <InfoRow
            Icon={CalendarBlankIcon}
            iconColor="#F59E0B"
            iconBg="#FFFBEB"
            label="Joined"
            value={joined}
          />
          <RowSeparator />
          <InfoRow
            Icon={CurrencyInrIcon}
            iconColor="#0F172A"
            iconBg="#F1F5F9"
            label="Monthly rent"
            value={`₹${tenant.rent.toLocaleString("en-IN")}`}
          />
        </InfoCard>

        {/* Payment history */}
        {tenant.paymentHistory.length > 0 ? (
          <InfoCard title={`Payment History (${tenant.paymentHistory.length})`}>
            {tenant.paymentHistory.map((p, idx) => (
              <React.Fragment key={p.month}>
                {idx > 0 ? <RowSeparator /> : null}
                <PaymentHistoryRow record={p} />
              </React.Fragment>
            ))}
          </InfoCard>
        ) : null}

        {/* Emergency contact */}
        {tenant.emergencyContact ? (
          <InfoCard title="Emergency Contact">
            <InfoRow
              Icon={UserIcon}
              iconColor="#BE123C"
              iconBg="#FFF1F2"
              label={tenant.emergencyContact.relation}
              value={tenant.emergencyContact.name}
              meta={
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `tel:${tenant.emergencyContact!.phone.replace(/\s+/g, "")}`
                    )
                  }
                  activeOpacity={0.7}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: "#FFF1F2",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PhoneIcon size={15} color="#BE123C" weight="fill" />
                </TouchableOpacity>
              }
            />
            <RowSeparator />
            <InfoRow
              Icon={PhoneIcon}
              iconColor="#64748B"
              iconBg="#F1F5F9"
              label="Phone"
              value={tenant.emergencyContact.phone}
            />
          </InfoCard>
        ) : null}

        {/* ID Proof */}
        {tenant.idProof ? (
          <InfoCard title="ID Proof">
            <InfoRow
              Icon={IdentificationCardIcon}
              iconColor="#2563EB"
              iconBg="#EFF6FF"
              label="Document"
              value={tenant.idProof.type}
              meta={
                tenant.idProof.verified ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: "#ECFDF5",
                    }}
                  >
                    <ShieldCheckIcon size={12} color="#047857" weight="fill" />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: "#047857",
                      }}
                    >
                      Verified
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: "#FFFBEB",
                    }}
                  >
                    <WarningCircleIcon
                      size={12}
                      color="#92400E"
                      weight="fill"
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: "#92400E",
                      }}
                    >
                      Pending
                    </Text>
                  </View>
                )
              }
            />
          </InfoCard>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ActionButton({
  Icon,
  label,
  onPress,
  primary,
}: {
  Icon: React.ComponentType<any>;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: primary ? "#2563EB" : "#fff",
        borderWidth: primary ? 0 : 1,
        borderColor: "#E2E8F0",
        paddingVertical: 12,
        borderRadius: 12,
      }}
    >
      <Icon
        size={16}
        color={primary ? "#fff" : "#0F172A"}
        weight={primary ? "fill" : "bold"}
      />
      <Text
        style={{
          fontSize: 13,
          fontWeight: "800",
          color: primary ? "#fff" : "#0F172A",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
