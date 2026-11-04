globalThis.AbbeyProtocol = {
  "protocol": "AIPI 510 Abbey Road sampling methods experiment",
  "date_london": "2026-11-03",
  "timezone": "Europe/London",
  "seed": 20261103,
  "selection": "36 nonoverlapping five-minute slots, stratified across 08:00-15:59 London time with 5,5,5,5,4,4,4,4 slots per hour, sampled with Python random.Random(seed); see generator source and manifest",
  "count_rule": "Count each individual pedestrian when reaching the middle of the nearer zebra crossing, either direction; no cars, sidewalks, or far crossing",
  "methods": {
    "ground_truth": "300-second whole-clip pedestrian crossing count",
    "A": "one 60-second block uniformly chosen from five blocks",
    "B": "one 10-second block uniformly chosen within each of six successive 50-second strata",
    "estimator": "observed_count * 5"
  },
  "observations": [
    {
      "id": "01",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "8:00 AM",
      "start_GMT": "08:05:00",
      "end_GMT": "08:10:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        40,
        60,
        100,
        190,
        220,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 8
    },
    {
      "id": "02",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "8:00 AM",
      "start_GMT": "08:10:00",
      "end_GMT": "08:15:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        0,
        60,
        130,
        160,
        220,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 8
    },
    {
      "id": "03",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "8:00 AM",
      "start_GMT": "08:15:00",
      "end_GMT": "08:20:00",
      "A_start_offset_seconds": 60,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        70,
        130,
        170,
        230,
        260
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 8
    },
    {
      "id": "04",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "8:00 AM",
      "start_GMT": "08:45:00",
      "end_GMT": "08:50:00",
      "A_start_offset_seconds": 60,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        40,
        50,
        100,
        150,
        220,
        260
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 8
    },
    {
      "id": "05",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "8:00 AM",
      "start_GMT": "08:50:00",
      "end_GMT": "08:55:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        60,
        100,
        180,
        220,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 8
    },
    {
      "id": "06",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "9:06 AM",
      "start_GMT": "09:15:00",
      "end_GMT": "09:20:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        70,
        100,
        190,
        200,
        270
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 9
    },
    {
      "id": "07",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "9:06 AM",
      "start_GMT": "09:20:00",
      "end_GMT": "09:25:00",
      "A_start_offset_seconds": 60,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        60,
        130,
        150,
        240,
        280
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 9
    },
    {
      "id": "08",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "9:06 AM",
      "start_GMT": "09:40:00",
      "end_GMT": "09:45:00",
      "A_start_offset_seconds": 60,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        0,
        60,
        140,
        150,
        230,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 9
    },
    {
      "id": "09",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "9:06 AM",
      "start_GMT": "09:45:00",
      "end_GMT": "09:50:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        0,
        90,
        120,
        160,
        210,
        270
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 9
    },
    {
      "id": "10",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "9:06 AM",
      "start_GMT": "09:55:00",
      "end_GMT": "10:00:00",
      "A_start_offset_seconds": 0,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        0,
        60,
        110,
        190,
        230,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 9
    },
    {
      "id": "11",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "10:00 AM",
      "start_GMT": "10:15:00",
      "end_GMT": "10:20:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        80,
        140,
        170,
        230,
        260
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 10
    },
    {
      "id": "12",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "10:00 AM",
      "start_GMT": "10:20:00",
      "end_GMT": "10:25:00",
      "A_start_offset_seconds": 180,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        0,
        90,
        100,
        150,
        240,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 10
    },
    {
      "id": "13",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "10:00 AM",
      "start_GMT": "10:25:00",
      "end_GMT": "10:30:00",
      "A_start_offset_seconds": 120,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        50,
        120,
        170,
        220,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 10
    },
    {
      "id": "14",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "10:00 AM",
      "start_GMT": "10:45:00",
      "end_GMT": "10:50:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        90,
        140,
        170,
        230,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 10
    },
    {
      "id": "15",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "10:00 AM",
      "start_GMT": "10:55:00",
      "end_GMT": "11:00:00",
      "A_start_offset_seconds": 120,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        40,
        70,
        110,
        150,
        220,
        270
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 10
    },
    {
      "id": "16",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "11:00 AM",
      "start_GMT": "11:10:00",
      "end_GMT": "11:15:00",
      "A_start_offset_seconds": 60,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        80,
        130,
        150,
        210,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 11
    },
    {
      "id": "17",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "11:00 AM",
      "start_GMT": "11:15:00",
      "end_GMT": "11:20:00",
      "A_start_offset_seconds": 180,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        10,
        90,
        130,
        160,
        220,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 11
    },
    {
      "id": "18",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "11:00 AM",
      "start_GMT": "11:20:00",
      "end_GMT": "11:25:00",
      "A_start_offset_seconds": 0,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        60,
        130,
        150,
        240,
        280
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 11
    },
    {
      "id": "19",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "11:00 AM",
      "start_GMT": "11:25:00",
      "end_GMT": "11:30:00",
      "A_start_offset_seconds": 60,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        80,
        140,
        150,
        240,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 11
    },
    {
      "id": "20",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "11:00 AM",
      "start_GMT": "11:40:00",
      "end_GMT": "11:45:00",
      "A_start_offset_seconds": 180,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        60,
        100,
        190,
        200,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 11
    },
    {
      "id": "21",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "12:00 PM",
      "start_GMT": "12:05:00",
      "end_GMT": "12:10:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        10,
        80,
        130,
        180,
        240,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 12
    },
    {
      "id": "22",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "12:00 PM",
      "start_GMT": "12:20:00",
      "end_GMT": "12:25:00",
      "A_start_offset_seconds": 120,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        40,
        90,
        140,
        150,
        210,
        280
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 12
    },
    {
      "id": "23",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "12:00 PM",
      "start_GMT": "12:35:00",
      "end_GMT": "12:40:00",
      "A_start_offset_seconds": 120,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        80,
        140,
        150,
        200,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 12
    },
    {
      "id": "24",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "12:00 PM",
      "start_GMT": "12:55:00",
      "end_GMT": "13:00:00",
      "A_start_offset_seconds": 0,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        40,
        80,
        140,
        160,
        200,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 12
    },
    {
      "id": "25",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "1:00 PM",
      "start_GMT": "13:10:00",
      "end_GMT": "13:15:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        50,
        100,
        150,
        210,
        280
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 13
    },
    {
      "id": "26",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "1:00 PM",
      "start_GMT": "13:20:00",
      "end_GMT": "13:25:00",
      "A_start_offset_seconds": 180,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        0,
        90,
        100,
        180,
        220,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 13
    },
    {
      "id": "27",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "1:00 PM",
      "start_GMT": "13:25:00",
      "end_GMT": "13:30:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        80,
        110,
        170,
        210,
        280
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 13
    },
    {
      "id": "28",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "1:00 PM",
      "start_GMT": "13:45:00",
      "end_GMT": "13:50:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        90,
        100,
        180,
        220,
        260
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 13
    },
    {
      "id": "29",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "2:00 PM",
      "start_GMT": "14:15:00",
      "end_GMT": "14:20:00",
      "A_start_offset_seconds": 180,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        90,
        140,
        150,
        240,
        270
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 14
    },
    {
      "id": "30",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "2:00 PM",
      "start_GMT": "14:20:00",
      "end_GMT": "14:25:00",
      "A_start_offset_seconds": 120,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        60,
        110,
        190,
        240,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 14
    },
    {
      "id": "31",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "2:00 PM",
      "start_GMT": "14:35:00",
      "end_GMT": "14:40:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        40,
        50,
        120,
        150,
        200,
        280
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 14
    },
    {
      "id": "32",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "2:00 PM",
      "start_GMT": "14:50:00",
      "end_GMT": "14:55:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        40,
        90,
        120,
        170,
        240,
        290
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 14
    },
    {
      "id": "33",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "3:00 PM",
      "start_GMT": "15:00:00",
      "end_GMT": "15:05:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        40,
        60,
        130,
        160,
        230,
        280
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 15
    },
    {
      "id": "34",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "3:00 PM",
      "start_GMT": "15:05:00",
      "end_GMT": "15:10:00",
      "A_start_offset_seconds": 240,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        70,
        110,
        160,
        230,
        280
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 15
    },
    {
      "id": "35",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "3:00 PM",
      "start_GMT": "15:25:00",
      "end_GMT": "15:30:00",
      "A_start_offset_seconds": 60,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        20,
        90,
        130,
        150,
        230,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 15
    },
    {
      "id": "36",
      "date": "2026-11-03",
      "timezone": "Europe/London",
      "archive_button": "3:00 PM",
      "start_GMT": "15:30:00",
      "end_GMT": "15:35:00",
      "A_start_offset_seconds": 0,
      "A_duration_seconds": 60,
      "B_start_offsets_seconds": [
        30,
        70,
        110,
        180,
        240,
        250
      ],
      "B_duration_each_seconds": 10,
      "hour_cluster": 15
    }
  ],
  "status": "SCHEDULE ONLY: no footage or counts validated for extension use; verify before marking complete."
};
globalThis.AbbeyProtocolSha256 = '6dee07a2710f2021d55d62e445ae15ab6ccbebdf01c085de91e140a8462e426d';
