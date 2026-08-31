import {
  useEffect,
  useState,
} from "react";


import BusinessLocationPicker from
  "../components/BusinessLocationPicker";

import type {
  Coordinates,
} from "../components/BusinessLocationPicker";

import {
  detectCurrentLocation,
} from "../lib/location";

import { supabase } from "../lib/supabase";

import "./RegisterBusiness.css";

type Category = {
  id: number;
  name: string;
};

function RegisterBusiness() {
  const [loading, setLoading] =
    useState(false);

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [mapPosition, setMapPosition] =
    useState<Coordinates | null>(null);

  const [locationStatus, setLocationStatus] =
    useState("");

  const [locationAccuracy, setLocationAccuracy] =
    useState<number | null>(null);

  const [locationWarning, setLocationWarning] =
    useState("");

  const [form, setForm] =
    useState({
      name: "",
      owner: "",
      category: "",
      customCategory: "",
      phone: "",
      whatsapp: "",
      email: "",
      website: "",
      description: "",
      area: "",
      landmark: "",
      latitude: "",
      longitude: "",
    });

  useEffect(() => {
    async function loadCategories() {
      const {
        data,
        error,
      } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error(
          "CATEGORY LOAD ERROR:",
          error
        );
        return;
      }

      if (data) {
        setCategories(data);
      }
    }

    loadCategories();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {
    setForm((current) => ({
      ...current,
      [e.target.name]:
        e.target.value,
    }));
  }

  function handleMapPositionChange(
    coordinates: Coordinates
  ) {
    setMapPosition(coordinates);

    setForm((current) => ({
      ...current,

      latitude:
        String(coordinates[0]),

      longitude:
        String(coordinates[1]),
    }));

    setLocationStatus(
      "Map location selected."
    );

    setLocationWarning("");
  }

  async function useCurrentLocation() {
    setLoading(true);

    setLocationStatus(
      "Detecting your current location..."
    );

    setLocationWarning("");

    try {
      const result =
        await detectCurrentLocation();

      const coordinates: Coordinates = [
        result.coordinates.latitude,
        result.coordinates.longitude,
      ];

      setMapPosition(coordinates);

      setLocationAccuracy(
        result.coordinates.accuracy
      );

      setForm((current) => ({
        ...current,

        latitude:
          String(
            result.coordinates.latitude
          ),

        longitude:
          String(
            result.coordinates.longitude
          ),
      }));

      if (result.address) {
        setLocationStatus(
          `Location detected: ${result.address}`
        );
      } else {
        setLocationStatus(
          "Location detected successfully."
        );
      }

      if (result.countryConflict) {
        const networkCountry =
          result.ipLocation
            ?.country_name ??
          "another country";

        setLocationWarning(
          `Your device location does not agree with your network location. Your network appears to be in ${networkCountry}. Please verify the marker on the map before registering.`
        );
      }
    } catch (error) {
      console.error(
        "CURRENT LOCATION ERROR:",
        error
      );

      setLocationStatus("");

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error
      ) {
        const geoError =
          error as GeolocationPositionError;

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            alert(
              "Location permission was denied. Please allow location access in your browser and try again."
            );
            break;

          case geoError.POSITION_UNAVAILABLE:
            alert(
              "Your device could not determine your current location."
            );
            break;

          case geoError.TIMEOUT:
            alert(
              "Location detection timed out. Please try again."
            );
            break;

          default:
            alert(
              "Unable to determine your current location."
            );
        }
      } else {
        alert(
          "Unable to determine your current location."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(
    file: File,
    folder: string
  ) {
    const fileName =
      `${folder}/${Date.now()}-${file.name}`;

    const {
      error,
    } = await supabase.storage
      .from("business-images")
      .upload(
        fileName,
        file
      );

    if (error) {
      throw error;
    }

    const {
      data,
    } = supabase.storage
      .from("business-images")
      .getPublicUrl(
        fileName
      );

    return data.publicUrl;
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const finalCategory =
        form.category === "Other"
          ? form.customCategory
          : form.category;

      if (
        form.category === "Other" &&
        form.customCategory.trim() !== ""
      ) {
        const {
          error:
            categoryError,
        } = await supabase
          .from("pending_categories")
          .insert([
            {
              name:
                form.customCategory.trim(),
            },
          ]);

        if (categoryError) {
          console.warn(
            "Pending category could not be saved:",
            categoryError
          );
        }
      }

      let logoUrl = "";
      let coverUrl = "";

      if (logoFile) {
        logoUrl =
          await uploadImage(
            logoFile,
            "logos"
          );
      }

      if (coverFile) {
        coverUrl =
          await uploadImage(
            coverFile,
            "covers"
          );
      }

      const {
        error,
      } = await supabase
        .from("business")
        .insert([
          {
            name: form.name,
            owner: form.owner,
            category:
              finalCategory,
            phone: form.phone,
            email: form.email,
            description:
              form.description,
            area: form.area,
            landmark:
              form.landmark,
            logo: logoUrl,
            cover_image:
              coverUrl,
            website:
              form.website,
            whatsapp:
              form.whatsapp,

            latitude:
              form.latitude === ""
                ? null
                : Number(
                    form.latitude
                  ),

            longitude:
              form.longitude === ""
                ? null
                : Number(
                    form.longitude
                  ),
          },
        ]);

      if (error) {
        console.error(
          "BUSINESS REGISTRATION ERROR:",
          error
        );

        alert(error.message);
        return;
      }

      alert(
        "Business registered successfully!"
      );

      setForm({
        name: "",
        owner: "",
        category: "",
        customCategory: "",
        phone: "",
        whatsapp: "",
        email: "",
        website: "",
        description: "",
        area: "",
        landmark: "",
        latitude: "",
        longitude: "",
      });

      setLogoFile(null);
      setCoverFile(null);
      setMapPosition(null);

      setLocationStatus("");
      setLocationAccuracy(null);
      setLocationWarning("");
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while registering the business."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

      <section className="register-business">
        <h1>
          Register Your Business
        </h1>

        <p>
          Join Abakwa Connect and reach
          customers wherever your business
          is located.
        </p>

        <form
          onSubmit={handleSubmit}
        >
          <label>
            Business Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>
            Owner's Name
          </label>

          <input
            type="text"
            name="owner"
            value={form.owner}
            onChange={handleChange}
            required
          />

          <label>
            Business Category
          </label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.name}
                >
                  {category.name}
                </option>
              )
            )}

            <option value="Other">
              Other
            </option>
          </select>

          {form.category ===
            "Other" && (
            <>
              <label>
                Specify Business Type
              </label>

              <input
                type="text"
                name="customCategory"
                value={
                  form.customCategory
                }
                onChange={
                  handleChange
                }
                required
              />
            </>
          )}

          <label>
            Business Logo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setLogoFile(
                e.target.files?.[0] ??
                  null
              )
            }
          />

          <label>
            Cover Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setCoverFile(
                e.target.files?.[0] ??
                  null
              )
            }
          />

          <label>
            Description
          </label>

          <textarea
            name="description"
            rows={4}
            value={
              form.description
            }
            onChange={
              handleChange
            }
          />

          <label>
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={
              handleChange
            }
          />

          <label>
            WhatsApp Number
          </label>

          <input
            type="tel"
            name="whatsapp"
            value={
              form.whatsapp
            }
            onChange={
              handleChange
            }
          />

          <label>
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={
              handleChange
            }
          />

          <label>
            Website
          </label>

          <input
            type="url"
            name="website"
            value={
              form.website
            }
            onChange={
              handleChange
            }
          />

          <label>
            Area
          </label>

          <input
            type="text"
            name="area"
            value={form.area}
            onChange={
              handleChange
            }
          />

          <label>
            Nearest Landmark
          </label>

          <input
            type="text"
            name="landmark"
            value={
              form.landmark
            }
            onChange={
              handleChange
            }
          />

          <label>
            Business Location
          </label>

          <p>
            Use your device location,
            click anywhere on the global
            map, or drag the marker to the
            exact business position.
          </p>

          <button
            type="button"
            onClick={
              useCurrentLocation
            }
            disabled={loading}
          >
            Ã°Å¸â€œÂ{" "}
            {loading
              ? "Detecting Location..."
              : "Use My Current Location"}
          </button>

          {locationStatus && (
            <p className="location-status">
              Ã°Å¸â€œÂ {locationStatus}
            </p>
          )}

          {locationAccuracy !==
            null && (
            <p className="location-accuracy">
              GPS accuracy:
              {" "}
              approximately{" "}
              {Math.round(
                locationAccuracy
              )}{" "}
              meters
            </p>
          )}

          {locationWarning && (
            <div className="location-warning">
              Ã¢Å¡Â Ã¯Â¸Â{" "}
              {locationWarning}
            </div>
          )}

          <label>
            Choose Business Location
            on Map
          </label>

          <BusinessLocationPicker
            position={
              mapPosition
            }
            onChange={
              handleMapPositionChange
            }
          />

          <label>
            Latitude
          </label>

          <input
            type="text"
            name="latitude"
            value={
              form.latitude
            }
            onChange={
              handleChange
            }
            placeholder="Latitude"
          />

          <label>
            Longitude
          </label>

          <input
            type="text"
            name="longitude"
            value={
              form.longitude
            }
            onChange={
              handleChange
            }
            placeholder="Longitude"
          />

          {form.latitude &&
            form.longitude && (
              <p className="location-confirmed">
                Ã¢Å“â€œ Business map location
                selected
              </p>
            )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register Business"}
          </button>
        </form>
      </section>
    </>
  );
}

export default RegisterBusiness;
