import {
  archestraApiSdk,
  type archestraApiTypes,
} from "@shared";

import { ForbiddenPage } from "@/app/_parts/forbidden-page";
import { ServerErrorFallback } from "@/components/error-fallback";
import type { ErrorExtended } from "@/types";
import { serverCanAccessPage } from "@/lib/auth/auth.server";
import { handleApiError } from "@/lib/utils";
import { getServerApiHeaders } from "@/lib/utils/server";
import AgentTemplatesPage from "./page.client";

export const dynamic = "force-dynamic";

export default async function AgentTemplatesServer() {
  try {
    if (!(await serverCanAccessPage("/agents"))) {
      return <ForbiddenPage />;
    }

    const headers = await getServerApiHeaders();

    return <AgentTemplatesPage />;
  } catch (error) {
    return <ServerErrorFallback error={error as ErrorExtended} />;
  }
}
