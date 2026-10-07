# CleanTrack — Smart Municipal Waste Transfer & Route Optimization Platform

CleanTrack is an enterprise-grade multi-portal municipal waste logistics web application designed for the **Greater Hyderabad Municipal Corporation (GHMC)** to optimize municipal waste transfers from local Zonal Dump Yards to the Jawaharnagar Main City Dump Yard.

---

## 🌟 Architecture & Key Features

### 1. 🏢 Zonal Dump Yard Manager Portal (`#zonal-manager`)
- **Interactive Yard Capacity Gauge:** Real-time visual progress gauge and status indicators:
  - 🟢 **< 50%:** Normal Capacity
  - 🟡 **50%–79%:** Moderate Fill
  - 🔴 **&ge; 80%:** **OVERFLOW ALERT** (triggers dispatch notification to Big Truck Drivers)
- **Small Truck Weighbridge Logging Terminal:**
  - Inputs: Vehicle Reg Number (e.g. `TS-07-UB-1234`), Driver Name, Net Payload (Tons, up to 5.0T max), Segregated Waste Category (Wet, Dry, Hazardous).
  - **Automatic Capacity Math:** Adding a small truck automatically updates the zonal station's accumulated tonnage and recalculates the active capacity percentage.
- **Recent Activity Log:** Live table of weighbridge arrivals with search, category filtering, and supervisor badges.

---

### 2. 🚛 Big Transfer Truck Driver Portal & Route Optimizer (`#truck-driver`)
- **Max-Heap Prioritized Zonal Queue:**
  - Backed by custom binary `MaxHeap` data structure (`O(log N)` push/pop, `O(N)` heapify) sorting all city zonal yards dynamically in descending order by fill percentage.
  - Priority badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), current waste tonnage, and depot distance.
- **Live Device Geolocation Starting Point:**
  - One-click **"📍 Take Location From Device"** using the browser HTML5 Geolocation API with high accuracy (`enableHighAccuracy: true`).
  - Automatically reverse-geocodes current street/locality address via Google Maps Geocoding API.
  - Generates multi-stop route origin directly from your device coordinates $\rightarrow$ selected Zonal Yards $\rightarrow$ Jawaharnagar Mega Landfill.
- **Interactive GIS Routing Engine:**
  - Displays Live Device GPS Pin (with pulsing accuracy halo) or Driver Depot pin, color-coded Zonal Dump Yard pins, and Jawaharnagar Mega Landfill terminal pin.
  - Multi-stop TSP nearest-neighbor route polyline generator with waypoint sequence badges.
- **Route Metrics Summary & Session 8 Cost Equation:**
  - Evaluates Total Distance (km), Estimated Travel Time (mins), Fuel Consumed (L at 3.2 km/L), and Session 8 Cost:
    $$\text{Cost} = (\text{Distance} \times \text{Fuel Rate}) + (\text{Time Penalty} \times \text{Overflow Count})$$
  - Interactive variable sliders for Diesel Price per Liter and Overflow Time Penalty.
- **Navigation Actions:**
  - **Launch Turn-by-Turn in Google Maps App** (generates official Google Maps deep link with origin, destination, and waypoints).
  - **Execute Municipal Transfer Dispatch** (clears bulk waste from visited stations and records official transfer tickets).

---

### 3. 📊 Academic Lab & Analytics Suite (`#analytics`)
- **OOP Architecture & Schema Viewer:**
  - Abstract base class `Truck`, polymorphic derived classes `SmallTruck` (5-Ton) and `BigTruck` (20-Ton), supervisory `ZoneManager`, and `CollectionManager`.
  - Interactive schema inspector with attributes, methods, contracts, and TypeScript code viewer with 1-click clipboard copy.
- **Empirical Hypothesis Testing:**
  - Statistical evaluation of **Test A (Fixed Routes)** vs. **Test B (Max-Heap Dynamic Routes)** validating ~20% fuel savings ($p < 0.001$, paired $t$-test).
  - 14-day empirical fuel comparison bar visualizer and budget conservation totals.
- **Leverage & Cost Matrix:**
  - Implementation Difficulty vs. Fuel Impact matrix across 4 operational municipal scenarios.
- **Algebraic Cost Sandbox:**
  - Live parameter sandbox testing the Session 8 equation with real-time currency breakdown.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open **`http://localhost:5173/`** in your browser.
