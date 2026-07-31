import { dedupeCourts } from "./courtDeduplication";

describe("dedupeCourts", () => {
  it("treats Africa and African Leadership University court names as one court", () => {
    const courts = [
      {
        id: "manual-alu",
        name: "African Leadership University Court",
        lat: -1.93519,
        lng: 30.15181,
      },
      {
        id: "seeded-alu",
        name: "Africa Leadership University Basketball Court",
        lat: -1.9351875,
        lng: 30.1518125,
      },
      {
        id: "cmu",
        name: "Carnegie Mellon University Basketball Court",
        lat: -1.9360625,
        lng: 30.1594375,
      },
    ];

    expect(dedupeCourts(courts).map((court) => court.id)).toEqual([
      "manual-alu",
      "cmu",
    ]);
  });
});
