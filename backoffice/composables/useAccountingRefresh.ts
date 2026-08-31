/** Rafraîchit la comptabilité au retour sur la page (ex. après la caisse). */
export function useAccountingRefresh(onRefresh: () => void | Promise<void>) {
  onActivated(() => {
    void onRefresh()
  })
}
