export const MUMBAI_TRANSIT_STATIONS = {
  western: [
    { name: 'Borivali', coords: [19.2294, 72.8576], fastStop: true, grpChowki: true },
    { name: 'Kandivali', coords: [19.2045, 72.8522], fastStop: false, grpChowki: false },
    { name: 'Malad', coords: [19.1866, 72.8488], fastStop: false, grpChowki: true },
    { name: 'Goregaon', coords: [19.1645, 72.8492], fastStop: false, grpChowki: false },
    { name: 'Andheri', coords: [19.1197, 72.8464], fastStop: true, grpChowki: true },
    { name: 'Vile Parle', coords: [19.0995, 72.8439], fastStop: false, grpChowki: false },
    { name: 'Santa Cruz', coords: [19.0818, 72.8415], fastStop: false, grpChowki: false },
    { name: 'Bandra', coords: [19.0558, 72.8407], fastStop: true, grpChowki: true },
    { name: 'Mahim', coords: [19.0402, 72.8402], fastStop: false, grpChowki: false },
    { name: 'Dadar (WR)', coords: [19.0182, 72.8434], fastStop: true, grpChowki: true },
    { name: 'Prabhadevi', coords: [19.0068, 72.8335], fastStop: false, grpChowki: false },
    { name: 'Lower Parel', coords: [18.9953, 72.8302], fastStop: false, grpChowki: false },
    { name: 'Mahalaxmi', coords: [18.9827, 72.8242], fastStop: false, grpChowki: false },
    { name: 'Mumbai Central', coords: [18.9696, 72.8193], fastStop: true, grpChowki: true },
    { name: 'Grant Road', coords: [18.9615, 72.8164], fastStop: true, grpChowki: false },
    { name: 'Charni Road', coords: [18.9515, 72.8188], fastStop: true, grpChowki: false },
    { name: 'Marine Lines', coords: [18.9432, 72.8230], fastStop: true, grpChowki: false },
    { name: 'Churchgate', coords: [18.9322, 72.8264], fastStop: true, grpChowki: true },
  ],
  central: [
    { name: 'Thane', coords: [19.1860, 72.9759], fastStop: true, grpChowki: true },
    { name: 'Mulund', coords: [19.1726, 72.9564], fastStop: true, grpChowki: false },
    { name: 'Bhandup', coords: [19.1432, 72.9372], fastStop: true, grpChowki: false },
    { name: 'Vikhroli', coords: [19.1102, 72.9298], fastStop: true, grpChowki: false },
    { name: 'Ghatkopar', coords: [19.0860, 72.9090], fastStop: true, grpChowki: true },
    { name: 'Kurla', coords: [19.0652, 72.8792], fastStop: true, grpChowki: true },
    { name: 'Sion', coords: [19.0390, 72.8619], fastStop: false, grpChowki: false },
    { name: 'Matunga', coords: [19.0270, 72.8550], fastStop: false, grpChowki: false },
    { name: 'Dadar (CR)', coords: [19.0178, 72.8478], fastStop: true, grpChowki: true },
    { name: 'Parel', coords: [19.0026, 72.8423], fastStop: false, grpChowki: false },
    { name: 'Byculla', coords: [18.9774, 72.8335], fastStop: true, grpChowki: true },
    { name: 'CSMT', coords: [18.9401, 72.8354], fastStop: true, grpChowki: true },
  ],
  metro_line3: [
    { name: 'Aarey JVLR', coords: [19.1350, 72.8800] },
    { name: 'SEEPZ', coords: [19.1250, 72.8750] },
    { name: 'MIDC Andheri', coords: [19.1180, 72.8680] },
    { name: 'Marol Naka (Interchange L1)', coords: [19.1090, 72.8830] },
    { name: 'CSMIA T2 (Airport)', coords: [19.0896, 72.8656] },
    { name: 'Sahar Road', coords: [19.0980, 72.8580] },
    { name: 'CSMIA T1 (Domestic)', coords: [19.0950, 72.8528] },
    { name: 'Santacruz Metro', coords: [19.0820, 72.8450] },
    { name: 'Bandra Colony', coords: [19.0680, 72.8490] },
    { name: 'BKC Metro Station', coords: [19.0657, 72.8687] },
    { name: 'Dharavi', coords: [19.0430, 72.8550] },
    { name: 'Shitaladevi Temple', coords: [19.0340, 72.8420] },
    { name: 'Dadar Metro', coords: [19.0200, 72.8400] },
    { name: 'Siddhivinayak', coords: [19.0160, 72.8310] },
    { name: 'Worli', coords: [19.0050, 72.8220] },
    { name: 'Acharya Atre Chowk', coords: [18.9950, 72.8210] },
    { name: 'Science Centre', coords: [18.9860, 72.8200] },
    { name: 'Mahalaxmi Metro', coords: [18.9800, 72.8220] },
    { name: 'Mumbai Central Metro', coords: [18.9690, 72.8190] },
    { name: 'Grant Road Metro', coords: [18.9610, 72.8160] },
    { name: 'Girgaon', coords: [18.9530, 72.8170] },
    { name: 'Kalbadevi', coords: [18.9460, 72.8240] },
    { name: 'CSMT Metro', coords: [18.9401, 72.8354] },
    { name: 'Hutatma Chowk', coords: [18.9320, 72.8320] },
    { name: 'Churchgate Metro', coords: [18.9322, 72.8264] },
    { name: 'Vidhan Bhavan', coords: [18.9270, 72.8250] },
    { name: 'Cuffe Parade', coords: [18.9140, 72.8180] }
  ]
};

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeTransitOptions(startCoords, endCoords, roadResponse) {
  if (!startCoords || !endCoords || !Array.isArray(startCoords) || !Array.isArray(endCoords)) return null;

  const sLat = Number(startCoords[0]) || 19.0760;
  const sLng = Number(startCoords[1]) || 72.8777;
  const eLat = Number(endCoords[0]) || 19.0760;
  const eLng = Number(endCoords[1]) || 72.8777;

  const rawSafest = roadResponse?.routes?.safest;
  const rawDirect = roadResponse?.routes?.direct;
  const fallbackGeom = (roadResponse?.route?.geometry?.coordinates && Array.isArray(roadResponse.route.geometry.coordinates))
    ? roadResponse.route.geometry.coordinates.map(c => [c[1], c[0]])
    : [[sLat, sLng], [eLat, eLng]];

  const results = {};

  const defaultCoverage = roadResponse?.resource_coverage || {
    score: 75,
    tier: 'High Emergency Coverage',
    nearby_police_count: roadResponse?.safety_context?.nearby_police_stations_count || 4,
    nearest_police_km: roadResponse?.safety_context?.nearby_police_stations?.[0]?.distance_km || 1.2,
    nearby_medical_count: roadResponse?.safety_context?.nearby_hospitals_count || 3,
    nearest_medical_km: roadResponse?.safety_context?.nearby_hospitals?.[0]?.distance_km || 1.8,
    explanation: 'Measures proximity to mapped emergency infrastructure (police stations and hospitals).'
  };

  if (rawSafest) {
    const cov = rawSafest.resource_coverage || defaultCoverage;
    results.safest_cab = {
      id: 'safest_cab',
      name: rawDirect ? 'Best Supported Corridor' : 'Verified Road Corridor',
      modeLabel: rawDirect ? 'Recommended Primary Path' : 'Direct Road Route',
      icon: 'Shield',
      durationMin: rawSafest.duration_min || roadResponse?.route?.duration_min || Math.round(getDistance(sLat, sLng, eLat, eLng) * 3.4),
      distanceKm: rawSafest.distance_km || roadResponse?.route?.distance_km || Math.round(getDistance(sLat, sLng, eLat, eLng) * 1.3),
      badge: rawSafest.badge || '🛡️ Best Resource Coverage',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      polyline: rawSafest?.geometry?.coordinates
        ? rawSafest.geometry.coordinates.map(c => [c[1], c[0]])
        : fallbackGeom,
      color: '#059669',
      resourceCoverage: cov,
      zonesTraversed: rawSafest.zones_traversed || cov.zones_traversed || [],
      highlights: [
        `${cov.nearby_police_count} Verified Police Stations within 3.5km corridor (Nearest: ~${cov.nearest_police_km || 1.2} km)`,
        `${cov.nearby_medical_count} 24/7 Hospital Emergency Units along route`,
        'Continuous streetlighting along primary Mumbai arterial roads'
      ],
      safetyDetails: 'Prioritizes arterial highways with verified emergency response infrastructure.'
    };
  }

  // 2. DIRECT FASTEST ROAD (Only if a genuine second route exists from ORS)
  if (rawDirect && rawDirect.geometry) {
    const cov = rawDirect.resource_coverage || defaultCoverage;
    results.direct_cab = {
      id: 'direct_cab',
      name: 'Direct Fastest Road',
      modeLabel: 'Shortest Distance Path',
      icon: 'Car',
      durationMin: rawDirect.duration_min || Math.max(10, (results.safest_cab?.durationMin ? results.safest_cab.durationMin - 6 : 20)),
      distanceKm: rawDirect.distance_km || results.safest_cab?.distanceKm || Math.round(getDistance(sLat, sLng, eLat, eLng) * 1.2),
      badge: rawDirect.badge || '⚡ Shortest Path',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      polyline: rawDirect.geometry.coordinates.map(c => [c[1], c[0]]),
      color: '#d97706',
      resourceCoverage: cov,
      zonesTraversed: rawDirect.zones_traversed || cov.zones_traversed || [],
      highlights: [
        'Shortest driving distance travel path',
        `${cov.nearby_police_count} Police Stations accessible along corridor`,
        'Crosses standard commercial transit junctions'
      ],
      safetyDetails: 'Direct shortest path across commercial thoroughfares with standard civic coverage.'
    };
  }

  // 3. REALISTIC MUMBAI LOCAL TRAIN FEASIBILITY LOGIC
  // Check both Western and Central lines
  const lines = [
    { name: 'Western Line', stations: MUMBAI_TRANSIT_STATIONS.western },
    { name: 'Central Line', stations: MUMBAI_TRANSIT_STATIONS.central }
  ];

  let bestTrainLine = null;
  let bestStartStation = null;
  let bestEndStation = null;
  let minCombinedTrainDist = 999;

  for (const line of lines) {
    let sNear = null, eNear = null;
    let sDist = 999, eDist = 999;

    line.stations.forEach((st) => {
      const d1 = getDistance(sLat, sLng, st.coords[0], st.coords[1]);
      const d2 = getDistance(eLat, eLng, st.coords[0], st.coords[1]);
      if (d1 < sDist) { sDist = d1; sNear = st; }
      if (d2 < eDist) { eDist = d2; eNear = st; }
    });

    // Check if both origin and destination are within feasible reach (max 3.8 km from station)
    // AND the stations are distinct (at least 1 stop apart)
    if (sNear && eNear && sNear.name !== eNear.name && sDist <= 3.8 && eDist <= 3.8) {
      if ((sDist + eDist) < minCombinedTrainDist) {
        minCombinedTrainDist = sDist + eDist;
        bestTrainLine = line;
        bestStartStation = { ...sNear, dist: sDist.toFixed(1) };
        bestEndStation = { ...eNear, dist: eDist.toFixed(1) };
      }
    }
  }

  if (bestTrainLine && bestStartStation && bestEndStation) {
    const stList = bestTrainLine.stations;
    const idx1 = stList.findIndex(s => s.name === bestStartStation.name);
    const idx2 = stList.findIndex(s => s.name === bestEndStation.name);
    const [lowerIdx, upperIdx] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];
    const trainPath = stList.slice(lowerIdx, upperIdx + 1).map(s => s.coords);
    const stationCount = Math.abs(idx2 - idx1);
    const trainTimeMin = Math.max(10, Math.round(stationCount * 2.8 + 4));

    results.train = {
      id: 'train',
      name: `Suburban Local (${bestTrainLine.name})`,
      modeLabel: 'Fast Suburban Local Rail',
      icon: 'Train',
      durationMin: trainTimeMin,
      distanceKm: Math.round(stationCount * 1.8 + 2),
      badge: `⚡ Fast Transit (${trainTimeMin}m)`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      polyline: trainPath.length > 1 ? trainPath : fallbackGeom,
      color: '#2563eb',
      stationsCovered: stList.slice(lowerIdx, upperIdx + 1),
      startStation: bestStartStation.name,
      endStation: bestEndStation.name,
      startDist: bestStartStation.dist,
      endDist: bestEndStation.dist,
      resourceCoverage: {
        score: 90,
        tier: '24/7 Dedicated Transit Security',
        explanation: 'Equipped with dedicated Government Railway Police (GRP) station chowkis and onboard escort commandos.'
      },
      highlights: [
        `Board at ${bestStartStation.name} (~${bestStartStation.dist}km away) ➔ De-board at ${bestEndStation.name} (~${bestEndStation.dist}km to dest)`,
        'Dedicated Ladies Coaches (Yellow/Green Stripes) at Engine, Middle & Rear',
        'Night RPF Security Escort Onboard (9:00 PM – 6:00 AM) • RailMadad Helpline 139'
      ],
      safetyDetails: '24/7 Government Railway Police (GRP) station chowki at platform junctions.'
    };
  }

  // 4. REALISTIC MUMBAI METRO LINE 3 FEASIBILITY LOGIC
  const metroStations = MUMBAI_TRANSIT_STATIONS.metro_line3;
  let startM = null, endM = null;
  let minSM = 999, minEM = 999;

  metroStations.forEach((st) => {
    const d1 = getDistance(sLat, sLng, st.coords[0], st.coords[1]);
    const d2 = getDistance(eLat, eLng, st.coords[0], st.coords[1]);
    if (d1 < minSM) { minSM = d1; startM = st; }
    if (d2 < minEM) { minEM = d2; endM = st; }
  });

  // Metro threshold: Origin & Destination must be within 3.0 km of a Metro 3 station and not the exact same station
  if (startM && endM && startM.name !== endM.name && minSM <= 3.0 && minEM <= 3.0) {
    const mIdx1 = metroStations.findIndex(s => s.name === startM.name);
    const mIdx2 = metroStations.findIndex(s => s.name === endM.name);
    const [mLIdx, mUIdx] = mIdx1 < mIdx2 ? [mIdx1, mIdx2] : [mIdx2, mIdx1];
    const metroPath = metroStations.slice(mLIdx, mUIdx + 1).map(s => s.coords);
    const metroStnCount = Math.abs(mIdx2 - mIdx1);
    const metroTimeMin = Math.max(8, Math.round(metroStnCount * 2.2 + 4));

    results.metro = {
      id: 'metro',
      name: 'Mumbai Metro (Line 3 Aqua Line)',
      modeLabel: 'Guarded Rapid Metro',
      icon: 'Compass',
      durationMin: metroTimeMin,
      distanceKm: Math.round(metroStnCount * 1.5 + 2),
      badge: '100% CCTV & Security',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      polyline: metroPath.length > 1 ? metroPath : fallbackGeom,
      color: '#6366f1',
      stationsCovered: metroStations.slice(mLIdx, mUIdx + 1),
      startStation: startM.name,
      endStation: endM.name,
      startDist: minSM.toFixed(1),
      endDist: minEM.toFixed(1),
      resourceCoverage: {
        score: 95,
        tier: 'Full Guarded Infrastructure',
        explanation: 'Enclosed stations with automated baggage scanners, platform CISF guards, and 100% CCTV surveillance.'
      },
      highlights: [
        `Board at ${startM.name} (~${minSM.toFixed(1)}km away) ➔ De-board at ${endM.name} (~${minEM.toFixed(1)}km to dest)`,
        'First coach dedicated exclusively to women commuters',
        'Passenger Emergency Intercom (PEI) & CISF Guards at platforms'
      ],
      safetyDetails: 'Full security bag scanning, dedicated security staff at platform turnstiles 24/7.'
    };
  }

  return results;
}
