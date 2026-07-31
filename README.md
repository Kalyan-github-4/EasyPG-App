<h1 align="center">
  <img
    src="https://res.cloudinary.com/dflelt85r/image/upload/v1785512063/ChatGPT_Image_May_10_2026_09_17_08_AM_1_c1nok1.png"
    alt="EasyPG Logo"
    width="70"
    valign="middle"
  />
  EasyPG
</h1>

<p align="center">
  <strong>A smarter way to discover and manage PGs, hostels, and mess accommodations.</strong>
</p>

<p align="center">
  EasyPG connects students and working professionals with suitable accommodations while giving property owners the tools they need to manage listings, inquiries, and booking requests.
</p>

---

## 📌 Overview

Finding reliable accommodation can be time-consuming, especially for students and professionals moving to a new city.

**EasyPG** simplifies this process by providing a mobile-first platform where users can:

* Discover PGs, hostels, and mess accommodations
* Search by location and personal preferences
* Compare rent, facilities, ratings, and availability
* View listings on an interactive map
* Save properties and contact owners directly
* Submit visit and booking inquiries

Property owners can create and manage listings, update availability, upload property images, and respond to potential tenants through a dedicated host experience.

---

## 📱 Screenshots

<table>
  <tr>
    <td align="center">
      <img src="https://res.cloudinary.com/dflelt85r/image/upload/v1785511453/WhatsApp_Image_2026-07-31_at_8.51.39_PM_1_yomtmr.jpg" width="220" alt="EasyPG home screen" />
      <br />
      <strong>Home</strong>
    </td>
    <td align="center">
      <img src="https://res.cloudinary.com/dflelt85r/image/upload/v1785511454/WhatsApp_Image_2026-07-31_at_8.51.39_PM_yzo9tu.jpg" width="220" alt="EasyPG map view" />
      <br />
      <strong>Map View</strong>
    </td>
    <td align="center">
      <img src="https://res.cloudinary.com/dflelt85r/image/upload/v1785511454/WhatsApp_Image_2026-07-31_at_8.51.37_PM_1_wx9ijl.jpg" width="220" alt="EasyPG property details screen" />
      <br />
      <strong>Property Details</strong>
    </td>
    <td align="center">
      <img src="https://res.cloudinary.com/dflelt85r/image/upload/v1785511453/WhatsApp_Image_2026-07-31_at_8.51.37_PM_n8t0mi.jpg" width="220" alt="EasyPG property inquiry form" />
      <br />
      <strong>Submit Inquiry</strong>
    </td>
  </tr>
</table>

---

## ✨ Features & Functionality

### 🔍 Property Discovery

Users can explore available accommodations based on their preferred city, budget, property type, and gender preference.

Key discovery features include:

* Search for PGs, hostels, and mess accommodations
* Filter listings by rent, location, gender, and property category
* Browse nearby accommodations using location-based search
* View available and trusted properties
* Explore detailed property information before contacting an owner

### 🗺️ Interactive Map Experience

EasyPG integrates an interactive map experience using Leaflet.js and OpenStreetMap.

Users can:

* View property locations on a map
* Identify nearby accommodations
* Understand the surrounding location before submitting an inquiry
* Open map-based listings for faster property discovery

### 🏡 Property Details

Each property listing includes the information users need to make an informed decision.

Property details may include:

* Property images
* Monthly rent
* Address and location
* Property type
* Gender preference
* Availability status
* Facilities and amenities
* Ratings and reviews
* Owner contact options

### ❤️ Saved Properties

Users can save preferred listings and revisit them later without searching again.

This helps users:

* Shortlist multiple properties
* Compare accommodation options
* Keep track of preferred listings
* Continue their search across multiple sessions

### 📩 Inquiry and Visit Requests

Interested users can submit inquiries or request a property visit directly from the application.

The inquiry workflow allows users to:

* Select a preferred visit date
* Provide contact information
* Send a message to the property owner
* Track booking or visit requests
* Receive status updates and notifications

### 📞 Direct Owner Contact

Users can contact property owners using supported communication options.

Available contact methods may include:

* Phone calls
* WhatsApp
* In-app inquiries
* Visit requests

### 🧑‍💼 Host Dashboard

Property owners have access to a dedicated host experience for managing their accommodations.

Hosts can:

* Create new property listings
* Upload property images
* Add rent, location, facilities, and availability details
* Update existing listings
* Manage incoming inquiries
* Review booking and visit requests
* Monitor listing performance
* Change property availability

### 🔐 Authentication and Role Management

EasyPG uses Clerk for authentication and supports role-based access.

The application supports:

* Email and password authentication
* Google authentication
* Secure session handling
* Guest and host roles
* Protected routes and APIs
* Role-specific dashboards and actions

### 🔔 Notifications

The notification system helps users and hosts stay informed about important activity.

Notifications may include:

* New inquiry alerts
* Booking request updates
* Visit request status changes
* Property availability updates
* Host responses

---

## 👥 User Roles

EasyPG supports two primary roles:

| Role  | Capabilities                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| Guest | Search properties, apply filters, view maps, save listings, contact hosts, and submit visit or booking requests |
| Host  | Create listings, upload images, update availability, manage inquiries, and review booking requests              |

---

## 🏘️ Property Categories

EasyPG supports multiple accommodation types:

* Paying Guest accommodations
* Hostels
* Mess accommodations

Listings may include amenities such as:

* Wi-Fi
* Air conditioning
* Food
* Laundry
* Parking
* Security
* CCTV
* Gym
* Power backup
* Water supply
* Furnished rooms

---

## 🛠️ Tech Stack

### Mobile Application

* React Native
* Expo
* Expo Router
* TypeScript
* NativeWind
* Phosphor Icons
* React Native WebView
* Leaflet.js
* OpenStreetMap

### Backend

* Node.js
* Express.js
* TypeScript
* REST APIs
* Drizzle ORM

### Database and Services

* PostgreSQL
* Neon Database
* Clerk Authentication
* Cloudinary
* Render
* Expo Application Services

---

## 🏗️ System Architecture

```text
React Native Mobile App
        │
        │ REST API
        ▼
Node.js + Express Backend
        │
        ├── Clerk Authentication
        ├── Cloudinary Media Storage
        ├── Neon PostgreSQL Database
        └── Drizzle ORM
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/EasyPG.git
cd EasyPG
```

### 2. Install mobile application dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside the backend directory:

```env
PORT=5000
DATABASE_URL=your_neon_postgresql_url

CLERK_SECRET_KEY=your_clerk_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=your_client_url
```

Create a `.env` file inside the Expo application directory:

```env
EXPO_PUBLIC_API_URL=your_backend_api_url
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

> Never commit `.env` files or private credentials to the repository.

---

## ▶️ Running the Project

### Start the backend server

```bash
cd server
npm run dev
```

### Start the Expo application

```bash
cd client
npx expo start
```

The mobile application can be opened using:

* Expo Go
* Android Emulator
* iOS Simulator
* Expo Development Build

---

## 🗄️ Database Setup

Generate and apply the Drizzle database migrations:

```bash
cd server
npm run db:generate
npm run db:migrate
```

Database commands may vary depending on the scripts configured in `package.json`.

---

## 🔌 API Overview

Primary API resources include:

```text
/api/users
/api/properties
/api/properties/nearby
/api/saved-listings
/api/inquiries
/api/booking-requests
/api/notifications
```

Protected endpoints require a valid Clerk authentication session.

---

## 🚀 Deployment

EasyPG can be deployed using the following services:

| Service            | Platform                  |
| ------------------ | ------------------------- |
| Mobile Application | Expo Application Services |
| Backend API        | Render                    |
| Database           | Neon PostgreSQL           |
| Media Storage      | Cloudinary                |
| Authentication     | Clerk                     |

### Backend URL

```text
https://your-easypg-backend.onrender.com
```

### Application Download

```text
APK: Add your application download link here
```

---

## 🛣️ Product Roadmap

Planned improvements include:

* Online rent payment support
* Verified property and owner badges
* User reviews and ratings
* In-app messaging between guests and hosts
* Property comparison tools
* Advanced map-based discovery
* AI-powered accommodation recommendations
* Dedicated administrator dashboard
* Property reporting and moderation
* Booking history and digital receipts

---

## 🤝 Contributing

Contributions, suggestions, and issue reports are welcome.

### Contribution workflow

1. Fork the repository
2. Create a feature branch

```bash
git switch -c feature/your-feature-name
```

3. Commit your changes

```bash
git commit -m "feat: add your feature"
```

4. Push the branch

```bash
git push origin feature/your-feature-name
```

5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

See the [`LICENSE`](./LICENSE) file for more information.

---

## 👨‍💻 Author

**Kalyan Manna**
Full-Stack Developer

* GitHub: [Kalyan-github-4](https://github.com/Kalyan-github-4)
* LinkedIn: Add your LinkedIn profile URL
* Portfolio: Add your portfolio URL

---

## ⭐ Support

If you find EasyPG useful, consider giving the repository a star.

Built with ❤️ to make accommodation discovery simpler, faster, and more accessible.
