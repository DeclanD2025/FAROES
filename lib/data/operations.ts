// Operational trip data. This file is the only source for time-critical
// transport assumptions introduced during the 26 July 2026 production audit.

export type ConfidenceLabel =
  | "Confirmed from booking"
  | "Verified from official source"
  | "Likely, but reconfirm before departure"
  | "Requires same-day verification"
  | "Contingency only";

export type TransportLeg = {
  id: string;
  date: string;
  title: string;
  operator: string;
  service: string;
  departure: string;
  arrival: string;
  duration: string;
  leaveBy: string;
  confidence: ConfidenceLabel;
  action: string;
  fallback: string;
};

export const OFFICIAL_SOURCES = {
  sslRoute7: {
    label: "SSL Route 7 timetable",
    url: "https://www.ssl.fo/en/timetable/ferry/7-suduroy-torshavn",
    checked: "26 July 2026",
  },
  sslRoute700: {
    label: "SSL Route 700 timetable",
    url: "https://www.ssl.fo/en/timetable/bus/700-sumba-vagur-tvoeroyri",
    checked: "26 July 2026",
  },
  sslBooking: {
    label: "SSL booking",
    url: "https://booking.ssl.fo",
    checked: "26 July 2026",
  },
  sslTravelCard: {
    label: "SSL Tourist Travel Card",
    url: "https://www.ssl.fo/en/prices/tourist-travel-card",
    checked: "26 July 2026",
  },
} as const;

export const CRITICAL_TRANSPORT: TransportLeg[] = [
  {
    id: "olavsoka-north",
    date: "Wed 29 Jul",
    title: "Krambatangi → Tórshavn · Ólavsøka",
    operator: "Strandfaraskip Landsins",
    service: "Route 7 · M/F Smyril · special Ólavsøka sailing",
    departure: "07:00",
    arrival: "~09:05",
    duration: "2h 05m",
    leaveBy: "Arrive at the terminal by 06:00; foot-passenger gate closes 06:55",
    confidence: "Verified from official source",
    action: "Pre-book the Øravík → Krambatangi taxi for an early arrival, save the ferry booking offline and join the foot-passenger queue. This is the day’s only northbound Ólavsøka sailing.",
    fallback: "If the morning sailing is missed or cancelled, remain on Suðuroy and use the local fallback plan. The next special sailing is southbound, not northbound.",
  },
  {
    id: "olavsoka-south",
    date: "Wed 29 Jul",
    title: "Tórshavn → Krambatangi · return from Ólavsøka",
    operator: "Strandfaraskip Landsins",
    service: "Route 7 · M/F Smyril · special Ólavsøka sailing",
    departure: "21:15",
    arrival: "~23:20",
    duration: "2h 05m",
    leaveBy: "Be at Farstøðin by 20:30; foot-passenger gate closes 21:10",
    confidence: "Verified from official source",
    action: "Set a non-negotiable 20:20 leave-now alarm, then walk to Farstøðin. Arrange the Krambatangi → Øravík taxi before leaving in the morning.",
    fallback: "Missing this sailing means an unplanned night in Tórshavn and puts Thursday’s match-day crossing at risk. Do not chase the midnight singing unless overnight accommodation is deliberately arranged.",
  },
  {
    id: "monday-arrival",
    date: "Mon 27 Jul",
    title: "Vágar Airport → Tórshavn → Krambatangi",
    operator: "Atlantic Airways / SSL",
    service: "RC 415 + booked AirportTaxi + booked Smyril Route 7",
    departure: "RC 415 arrives 18:35 (booking record)",
    arrival: "Krambatangi 23:20; Øravík transfer follows",
    duration: "Booked 2h 05m ferry crossing",
    leaveBy: "Ferry foot-passenger gate closes 21:10",
    confidence: "Confirmed from booking",
    action: "AirportTaxi and the 21:15 Smyril for two foot passengers are booked. Keep the ferry QR ticket offline and monitor RC 415; a substantial flight delay can still break the connection.",
    fallback: "Stay in Tórshavn; use the next verified Route 7 sailing and arrange the Suðuroy transfer with SSL or a pre-booked taxi.",
  },
  {
    id: "thursday-north",
    date: "Thu 30 Jul",
    title: "Krambatangi → Tórshavn",
    operator: "Strandfaraskip Landsins",
    service: "Route 7 · M/F Smyril · foot passenger",
    departure: "11:30",
    arrival: "13:35",
    duration: "2h 05m",
    leaveBy: "Be at Krambatangi by 10:30",
    confidence: "Verified from official source",
    action: "Foot-passenger gate closes five minutes before departure. SSL permits queuing at Krambatangi one hour before sailing. Pre-book / confirm the passenger reservation.",
    fallback: "The next northbound Thursday sailing arrives after kick-off. A cancellation means the match journey fails.",
  },
  {
    id: "thursday-south",
    date: "Thu 30 Jul",
    title: "Tórshavn → Krambatangi",
    operator: "Strandfaraskip Landsins",
    service: "Route 7 · M/F Smyril · foot passenger",
    departure: "21:15",
    arrival: "23:20",
    duration: "2h 05m",
    leaveBy: "Reach the foot-passenger gate by 20:30; it closes 21:10",
    confidence: "Verified from official source",
    action: "Carry an overnight layer, medicines, charger and ID to the match. Leave the stadium immediately after the required work; do not plan food or interviews after full time.",
    fallback: "If missed or cancelled: stay in Tórshavn, contact SSL, then reassess Friday's northbound plan. There is no late-night land alternative.",
  },
  {
    id: "friday-north",
    date: "Fri 31 Jul",
    title: "Suðuroy → Tórshavn",
    operator: "Strandfaraskip Landsins",
    service: "Route 7 · M/F Smyril",
    departure: "07:00 or 16:00 (Friday timetable)",
    arrival: "13:00 or 18:30 respectively",
    duration: "Official page states 2h 05m; timetable connection must be reconfirmed",
    leaveBy: "Book the Øravík/Krambatangi taxi and choose a sailing before Thursday evening",
    confidence: "Verified from official source",
    action: "The old 11:30 Friday plan is not a Friday Route 7 sailing. Confirm the exact terminal call, foot-passenger booking and onward Tórshavn → Sørvágur connection with SSL.",
    fallback: "If the 07:00 is impractical after match day, the 16:00 protects rest but requires a confirmed late transfer or accommodation alternative.",
  },
];

export const DAY_OPERATIONS = [
  {
    number: 1,
    date: "Monday 27 July 2026",
    base: "Øravík, Suðuroy — via booked AirportTaxi and Smyril",
    chapter: "The journey north",
    briefing: "The taxi and last sailing are booked; protect the flight-to-ferry connection.",
    carry: ["offline booking records", "water and food", "warm layer", "Tórshavn overnight details"],
    actions: [
      ["Before Edinburgh", "Check RC 415 status and save the AirportTaxi and ferry QR confirmations offline."],
      ["After landing", "Meet the booked AirportTaxi and go straight to Farstøðin; it is arranged around RC 415."],
      ["If the 21:15 ferry cannot be safely reached", "Stay in Tórshavn. Inform the Øravík host and move the arrival plan to Tuesday."],
    ],
    risk: "The booked taxi and ferry protect the plan; a material RC 415 delay remains the only critical break point.",
  },
  {
    number: 2,
    date: "Tuesday 28 July 2026",
    base: "Øravík, Suðuroy",
    chapter: "The cliffs of Suðuroy",
    briefing: "Use the clear-weather window for the approved Øravík Fell Loop.",
    carry: ["trail shoes", "waterproof layer", "phone with GPX saved offline", "water", "warm layer"],
    actions: [
      ["Before leaving", "Check weather and visibility. Do not use the fell section in fog, strong wind, heavy rain or darkness."],
      ["Run block", "Walk 112 m to Bønhúsið, allow 55–75 minutes moving time plus warm-up, stops, cool-down, shower and food."],
      ["Later", "Buy the next morning's supplies and verify Wednesday's reduced Ólavsøka local-bus service if travelling beyond Øravík."],
    ],
    risk: "The GPX supports a 4.13 km loop, but weather—not pace—decides whether it is safe.",
  },
  {
    number: 3,
    date: "Wednesday 29 July 2026 · Ólavsøka",
    base: "Øravík → Krambatangi → Tórshavn → Øravík",
    chapter: "Ólavsøka",
    briefing: "An early Smyril crossing gives a full national-day visit to Tórshavn; protect the 21:15 return.",
    carry: ["ferry booking", "charged power bank", "water and food", "waterproof and warm layer", "cash/card"],
    actions: [
      ["05:45 · taxi to Krambatangi", "Use the pre-booked Øravík transfer. Aim to be at the terminal by 06:00; this is an Ólavsøka sailing, so do not rely on a last-minute local bus."],
      ["07:00 · Smyril northbound", "Route 7 sails to Tórshavn (about 2h 05m). Keep the booking ready; the foot-passenger gate closes at 06:55."],
      ["~09:05 · Tórshavn", "Walk into the centre for the national-day procession, Parliament opening and the city programme. Check the live programme on Tímin when you arrive: events and road closures shift during the festival."],
      ["Day · festival rhythm", "Use the harbour, Tinganes, exhibitions, food stalls, music and chain dancing as the day unfolds. The 29th is a holiday: treat shops as closed unless you have confirmed otherwise."],
      ["20:20 · leave for Farstøðin", "Set an alarm and leave the centre for the ferry terminal. Be there by 20:30; the 21:15 foot-passenger gate closes at 21:10."],
      ["21:15 · Smyril southbound", "Return to Krambatangi around 23:20, then take the pre-arranged taxi to Øravík. Save Thursday’s match-day items for packing before bed."],
    ],
    risk: "The 07:00 northbound ferry and 21:15 return are the only published special Route 7 pair for Ólavsøka Day. Festival crowds and weather make an early terminal arrival and a strict evening exit essential.",
  },
  {
    number: 4,
    date: "Thursday 30 July 2026 · match day",
    base: "Øravík, Suðuroy",
    chapter: "Motherwell v HB",
    briefing: "The return ferry is possible only with a disciplined stadium exit.",
    carry: ["match ticket/accreditation", "ferry booking", "phone and power bank", "overnight essentials", "waterproof layer"],
    actions: [
      ["10:15", "Leave Øravík by pre-booked taxi for Krambatangi; do not assume a convenient local bus."],
      ["10:30", "Join the foot-passenger queue for the verified 11:30 Smyril."],
      ["20:00", "Target stadium exit at the final whistle. Be at the ferry gate no later than 20:30; the gate closes at 21:10."],
    ],
    risk: "Extra time, delayed coverage, a slow exit or ferry disruption can make the return fail. The itinerary is tight but conditionally viable.",
  },
  {
    number: 5,
    date: "Friday 31 July 2026",
    base: "Øravík → Tórshavn → Sørvágur",
    chapter: "Repositioning north",
    briefing: "The old 11:30 northbound ferry does not run on Friday.",
    carry: ["all luggage", "Guesthouse Hugo confirmation", "taxi contact", "food and water"],
    actions: [
      ["Thursday evening · commit", "Choose the verified 07:00 or 16:00 Route 7 sailing, then confirm the foot-passenger booking, Øravík/Krambatangi taxi and terminal arrival time."],
      ["Before leaving Øravík", "Pack every essential in one day bag: passport, charger, medication, hotel confirmation, ferry record and food/water. Buy food on Suðuroy; do not assume a convenient stop later."],
      ["At Tórshavn · onward transport", "Confirm the actual Tórshavn–Sørvágur connection before relying on it. If it is not safe, arrange a taxi or accommodation rather than boarding a ferry into an unfinished chain."],
      ["Before the ferry leaves", "Message Guesthouse Hugo with the realistic arrival time and save self-check-in instructions offline. Confirm late arrival is accepted if using the 16:00 sailing."],
    ],
    risk: "Friday onward travel is not operationally complete until the selected ferry-to-Sørvágur connection and late check-in are confirmed.",
  },
  {
    number: 6,
    date: "Saturday 1 August 2026",
    base: "Sørvágur → Vágar Airport → home",
    chapter: "Homeward, via London",
    briefing: "Confirm the airport transfer the evening before; keep a taxi fallback.",
    carry: ["passport", "boarding passes offline", "phone cable", "travel insurance details"],
    actions: [
      ["Friday evening", "Confirm the Saturday Route 300 service or pre-book the short airport taxi."],
      ["Before leaving Hugo", "Complete online check-in and verify flight status."],
      ["At Gatwick", "Use only a coach or rail option that preserves the separate Stansted flight check-in buffer."],
    ],
    risk: "The separate Gatwick–Stansted transfer remains a personal-connection risk, not an airline-protected connection.",
  },
] as const;

export const BOOKINGS_AUDIT = [
  { name: "Øravík accommodation", provider: "Booking record", date: "27–31 Jul", status: "Confirmed from booking" as ConfidenceLabel, action: "Save host arrival instructions offline; arrival night remains dependent on Monday transport.", location: "Við Á 7, Øravík, 827, Faroe Islands" },
  { name: "Guesthouse Hugo", provider: "Booking record", date: "31 Jul–1 Aug", status: "Confirmed from booking" as ConfidenceLabel, action: "Confirm late-arrival procedure after the Friday ferry choice is made.", location: "Sørvágur" },
  { name: "Atlantic Airways flights", provider: "Booking record", date: "27 Jul / 1 Aug", status: "Confirmed from booking" as ConfidenceLabel, action: "Check in online and save boarding passes offline.", location: "EDI–FAE / FAE–LGW" },
  { name: "Monday Smyril to Suðuroy", provider: "SSL booking record", date: "27 Jul · 21:15", status: "Confirmed from booking" as ConfidenceLabel, action: "Two adult foot passengers. Save the QR ticket offline and reach the foot-passenger gate before its 21:10 closure.", location: "Tórshavn → Krambatangi" },
  { name: "Thursday Smyril outbound", provider: "SSL Route 7", date: "30 Jul · 11:30", status: "Verified from official source" as ConfidenceLabel, action: "Confirm / retain foot-passenger booking before Wednesday evening.", location: "Krambatangi → Tórshavn" },
  { name: "Thursday Smyril return", provider: "SSL Route 7", date: "30 Jul · 21:15", status: "Verified from official source" as ConfidenceLabel, action: "Confirm / retain foot-passenger booking and carry overnight essentials.", location: "Tórshavn → Krambatangi" },
  { name: "Friday repositioning", provider: "SSL Route 7", date: "31 Jul · 07:00 or 16:00", status: "Requires same-day verification" as ConfidenceLabel, action: "Choose the sailing and verify terminal, onward transfer and Hugo late-arrival before Thursday evening.", location: "Suðuroy → Tórshavn → Sørvágur" },
] as const;
