import { getDefaultAccount, updateDefaultAccount } from "@/app/actions/account";

import useSWR from "swr";

export function useDefaultAccount() {
  const {
    data: defaultAccountId,
    mutate: mutateDefaultAccount,
    error,
  } = useSWR("default-account", getDefaultAccount);

  const updateDefault = async (accountId: string) => {
    await mutateDefaultAccount(
      async () => {
        await updateDefaultAccount(accountId);
        return accountId;
      },
      {
        optimisticData: accountId,
        rollbackOnError: true,
        revalidate: true,
      },
    );
  };

  return {
    defaultAccountId,
    updateDefault,
    isLoading: !defaultAccountId && !error,
    error,
  };
}
