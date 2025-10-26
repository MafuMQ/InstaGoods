
import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LocationProvider } from "@/context/LocationContext";
import { LoadScript } from "@react-google-maps/api";
import "./index.css";
import { OnlyAvailableProvider } from './context/OnlyAvailableContext';

	createRoot(document.getElementById("root")!).render(
		<LoadScript googleMapsApiKey="AIzaSyDgXizfpUFvwyV-h8dB88KP_EkHsMCGWgM" libraries={['places']} >
			<LocationProvider>
				<OnlyAvailableProvider>
					<App />
				</OnlyAvailableProvider>
			</LocationProvider>
		</LoadScript>
	);
