const OFFLINE_THRESHOLD_MINUTES = 2;

// Initialize the map
const map = L.map('map').setView([-17.8252, 31.0335], 6); // Zimbabwe center

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

// Example marker
const marker = L.marker([-17.8252, 31.0335]).addTo(map);
marker.bindPopup("<b>Hello!</b><br>Seal location.").openPopup();
const SUPABASE_URL = "https://szyeoafmtjzjahejpcsk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eWVvYWZtdGp6amFoZWpwY3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjEyMDQsImV4cCI6MjA4NDMzNzIwNH0.6w80j_5J4gC7UOgtBVafnim3jHo0CK3UyzP__DVJ-A0";

const supabase = supabasejs.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
async function loadGpsLogs() {
  const { data, error } = await supabase
    .from("gps_logs")
    .select(`
      seal_id,
      latitude,
      longitude,
      timestamp,
      seals (
        seal_code,
        status,
        tampered
      )
    `)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(updateMarker);
}

loadGpsLogs();
function updateMarker(log) {
  const { seal_id, latitude, longitude, seals } = log;

  // Marker color logic
  let color = "green";
  if (seals.tampered) color = "red";
  else if (seals.status === "UNLOCKED") color = "orange";

  const icon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  if (!markers[seal_id]) {
    markers[seal_id] = L.marker([latitude, longitude], { icon }).addTo(map);
  } else {
    markers[seal_id].setLatLng([latitude, longitude]);
    markers[seal_id].setIcon(icon);
  }

  markers[seal_id].bindPopup(`
    <b>Seal Code:</b> ${seals.seal_code}<br>
    <b>Status:</b> ${seals.status}<br>
    <b>Tampered:</b> ${seals.tampered}<br>
    <b>Lat:</b> ${latitude}<br>
    <b>Lng:</b> ${longitude}
  `);
}
supabase
  .channel("gps-realtime")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "gps_logs",
    },
    payload => {
      updateMarker(payload.new);
    }
  )
  .subscribe();
async function getLastActivity(sealId) {
  const { data } = await supabase
    .from("activity_logs")
    .select("activity, timestamp")
    .eq("seal_id", sealId)
    .order("timestamp", { ascending: false })
    .limit(1);

  return data?.[0];
}
function isOffline(lastTimestamp) {
  const lastSeen = new Date(lastTimestamp);
  const now = new Date();

  const diffMinutes = (now - lastSeen) / 60000;
  return diffMinutes > OFFLINE_THRESHOLD_MINUTES;
}
function updateMarker(log) {
    showOfflineWarning(isOffline(timestamp));

  const { seal_id, latitude, longitude, timestamp, seals } = log;

  let statusText = "ONLINE";
  let color = "green";

  if (isOffline(timestamp)) {
    statusText = "OFFLINE (ESP32 NOT CONNECTED)";
    color = "grey";
  } else if (seals.tampered) {
    statusText = "TAMPERED";
    color = "red";
  } else if (seals.status === "UNLOCKED") {
    statusText = "UNLOCKED";
    color = "orange";
  }

  const icon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  if (!markers[seal_id]) {
    markers[seal_id] = L.marker([latitude, longitude], { icon }).addTo(map);
  } else {
    markers[seal_id].setLatLng([latitude, longitude]);
    markers[seal_id].setIcon(icon);
  }

  markers[seal_id].bindPopup(`
    <b>Seal:</b> ${seals.seal_code}<br>
    <b>Status:</b> ${statusText}<br>
    <b>Last Update:</b> ${new Date(timestamp).toLocaleString()}
  `);
}
function showOfflineWarning(show) {
  const banner = document.getElementById("status-banner");
  banner.textContent = "⚠ ESP32 DEVICE OFFLINE";
  banner.style.display = show ? "block" : "none";
}
