"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <AntdRegistry>{children}</AntdRegistry>
    </AppRouterCacheProvider>
  );
}