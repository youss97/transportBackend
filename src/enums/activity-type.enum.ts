export enum ActivityType {
  CLOCK_IN = 'pointage_entree',
  CLOCK_OUT = 'pointage_sortie',
  VEHICLE_CHECK = 'etat_lieux',
  LOADING = 'chargement',
  UNLOADING = 'dechargement',
  FUEL = 'carburant',
  INCIDENT = 'incident',
  BREAK_START = 'pause_debut',    // 🔴 début de pause
  BREAK_END = 'pause_fin'         // 🟢 fin de pause
}
