import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";


import { useAuth } from "../core/auth";

import BusinessLocationPicker from "../components/BusinessLocationPicker";

import type {
  Coordinates,
} from "../components/BusinessLocationPicker";

import {
  supabase,
} from "../lib/supabase";

import {
  getBestLocation,
} from "../lib/locationService";

import "./RegisterBusiness.css";

type Category = {
  id: number;
  name: string;
};

type DetectedLocation = {
  source:
    | "device" | "browser" | "network" | "manual" | "none";

  accuracy:
    | number
    | null;
};

function RegisterBusiness() {
  const { user } = useAuth();
  const [loading, setLoading] =
    useState(false);

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  /*
   * Position used to initially position the map.
   *
   * IMPORTANT:
   *
   * This does NOT automatically confirm the business
   * location.
   *
   * The user must click the exact position or drag
   * the marker.
   */
  const [mapPosition, setMapPosition] =
    useState<Coordinates | null>(null);

  /*
   * True only after the user explicitly clicks the map
   * or drags the marker.
   */
  const [
    mapLocationConfirmed,
    setMapLocationConfirmed,
  ] = useState(false);

  /*
   * Information about the automatic browser/device
   * location.
   */
  const [
    detectedLocation,
    setDetectedLocation,
  ] =
    useState<DetectedLocation | null>(
      null
    );

  const [
    locationDetecting,
    setLocationDetecting,
  ] =
    useState(true);

  const [
    locationStatus,
    setLocationStatus,
  ] =
    useState("");

  const [
    locationAccuracy,
    setLocationAccuracy,
  ] =
    useState<number | null>(null);

  const [
    locationWarning,
    setLocationWarning,
  ] =
    useState("");

  const [
    form,
    setForm,
  ] = useState({
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

  /*
   * ============================================================
   * AUTOMATIC DEVICE/BROWSER LOCATION
   * ============================================================
   *
   * The device/browser location is used ONLY to position the
   * map initially.
   *
   * It is NOT automatically saved as the business location.
   *
   * There is no hard-coded Bamenda/Bambili/Tubah coordinate.
   */
  useEffect(() => {
    let cancelled = false;

    async function detectBusinessLocation() {
      setLocationDetecting(true);

      setLocationStatus(
        "Detecting your device/browser location..."
      );

      try {
        const result =
          await getBestLocation();

        if (cancelled) {
          return;
        }

        console.log(
          "ECOS INITIAL LOCATION RESULT:",
          result
        );

        setDetectedLocation({
          source:
            result.source,

          accuracy:
            result.accuracy,
        });

        setLocationAccuracy(
          result.accuracy
        );

        /*
         * DEVICE/BROWSER LOCATION AVAILABLE
         *
         * Use it to position the map.
         */
        if (
          result.coordinates &&
          (
            result.source ===
              "device" ||
            result.source ===
              "browser"
          )
        ) {
          setMapPosition(
            result.coordinates
          );

          setMapLocationConfirmed(
            false
          );

          /*
           * IMPORTANT:
           *
           * Do NOT put the coordinates into the form yet.
           *
           * The user must select the exact business location.
           */
          setForm((current) => ({
            ...current,

            latitude: "",

            longitude: "",
          }));

          if (
            result.accuracy !== null
          ) {
            setLocationStatus(
              `Your device/browser location was found. Accuracy is approximately ${Math.round(
                result.accuracy
              )} meters. Select the exact business location on the map.`
            );
          } else {
            setLocationStatus(
              "Your device/browser location was found. Select the exact business location on the map."
            );
          }

          if (
            result.warning
          ) {
            setLocationWarning(
              result.warning
            );
          } else {
            setLocationWarning(
              ""
            );
          }

          console.log(
            "ECOS MAP INITIALIZED FROM DEVICE/BROWSER:",
            result.coordinates
          );
        } else {
          /*
           * NO DEVICE LOCATION
           *
           * Do not use network/IP coordinates.
           *
           * The map will remain available and the user
           * can search manually.
           */
          setMapPosition(
            null
          );

          setMapLocationConfirmed(
            false
          );

          setForm((current) => ({
            ...current,

            latitude: "",

            longitude: "",
          }));

          setLocationStatus(
            "Your device/browser location is unavailable. Search for the area or move the map manually, then select the exact business location."
          );

          setLocationWarning(
            result.warning ??
              "Automatic device location is unavailable. Please search for the business location manually."
          );

          console.log(
            "ECOS: No automatic device position available."
          );
        }
      } catch (error) {
        console.error(
          "ECOS LOCATION DETECTION ERROR:",
          error
        );

        if (!cancelled) {
          setMapPosition(
            null
          );

          setMapLocationConfirmed(
            false
          );

          setDetectedLocation(
            null
          );

          setLocationStatus(
            "Device/browser location could not be determined. Search for the business location manually."
          );

          setLocationWarning(
            "Automatic location detection failed. Please search for or select the exact business location on the map."
          );
        }
      } finally {
        if (!cancelled) {
          setLocationDetecting(
            false
          );
        }
      }
    }

    void detectBusinessLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * LOAD CATEGORIES
   * ============================================================
   */
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
        setCategories(
          data
        );
      }
    }

    void loadCategories();
  }, []);

  /*
   * ============================================================
   * FORM CHANGE
   * ============================================================
   */
  function handleChange(
    e: ChangeEvent<
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

  /*
   * ============================================================
   * EXACT MAP LOCATION SELECTED
   * ============================================================
   *
   * This function is called when:
   *
   * - user clicks the map
   * - user drags the marker
   */
  function handleMapPositionChange(
    coordinates: Coordinates
  ) {
    console.log(
      "ECOS EXACT BUSINESS LOCATION SELECTED:",
      coordinates
    );

    /*
     * Update the map.
     */
    setMapPosition(
      coordinates
    );

    /*
     * NOW ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â and only now ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â save the coordinates
     * into the registration form.
     */
    setForm((current) => ({
      ...current,

      latitude:
        coordinates[0].toFixed(
          7
        ),

      longitude:
        coordinates[1].toFixed(
          7
        ),
    }));

    /*
     * The user explicitly selected this position.
     */
    setMapLocationConfirmed(
      true
    );

    setLocationStatus(
      "Exact business location selected."
    );

    setLocationWarning(
      ""
    );
  }

  /*
   * ============================================================
   * USE CURRENT LOCATION AGAIN
   * ============================================================
   *
   * This button re-requests the browser/device location.
   *
   * It moves the map there but DOES NOT automatically confirm
   * the business location.
   */
  async function useCurrentLocation() {
    setLoading(
      true
    );

    setLocationStatus(
      "Requesting your current device/browser location..."
    );

    setLocationWarning(
      ""
    );

    /*
     * The old exact business location is no longer confirmed.
     */
    setMapLocationConfirmed(
      false
    );

    setForm((current) => ({
      ...current,

      latitude: "",

      longitude: "",
    }));

    try {
      const result =
        await getBestLocation();

      console.log(
        "ECOS CURRENT LOCATION RESULT:",
        result
      );

      if (
        !result.coordinates ||
        (
          result.source !==
            "device" &&
          result.source !==
            "browser"
        )
      ) {
        setLocationStatus(
          "Your device/browser location is unavailable. Search for the business location manually on the map."
        );

        setLocationWarning(
          result.warning ??
            "No device/browser location was available."
        );

        setMapPosition(
          null
        );

        return;
      }

      /*
       * Move map to actual browser/device position.
       */
      setMapPosition(
        result.coordinates
      );

      setLocationAccuracy(
        result.accuracy
      );

      setDetectedLocation({
        source:
          result.source,

        accuracy:
          result.accuracy,
      });

      /*
       * IMPORTANT:
       *
       * Do NOT put these coordinates into the form.
       *
       * The user must click the exact point.
       */
      setMapLocationConfirmed(
        false
      );

      setForm((current) => ({
        ...current,

        latitude: "",

        longitude: "",
      }));

      if (
        result.accuracy !== null
      ) {
        setLocationStatus(
          `Current device/browser position found with approximately ${Math.round(
            result.accuracy
          )} meters accuracy. Click the exact business location on the map.`
        );
      } else {
        setLocationStatus(
          "Current device/browser position found. Click the exact business location on the map."
        );
      }

      setLocationWarning(
        result.warning ??
          "The map has been positioned using your device/browser location. Select the exact business location."
      );
    } catch (error) {
      console.error(
        "CURRENT LOCATION ERROR:",
        error
      );

      setLocationStatus(
        "Unable to determine your device/browser location."
      );

      setLocationWarning(
        "Please search for the business location manually on the map."
      );

      setMapLocationConfirmed(
        false
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /*
   * ============================================================
   * IMAGE UPLOAD
   * ============================================================
   */
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

  /*
   * ============================================================
   * SUBMIT BUSINESS
   * ============================================================
   */
  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    /*
     * A business must belong to an authenticated user.
     */
    if (!user) {
      alert(
        "Please sign in before registering a business."
      );

      return;
    }

    /*
     * EXACT LOCATION IS REQUIRED.
     */
    if (
      !mapLocationConfirmed ||
      !form.latitude ||
      !form.longitude
    ) {
      alert(
        "Please select the exact business location on the map before registering."
      );

      return;
    }

    setLoading(
      true
    );

    try {
      const finalCategory =
        form.category ===
        "Other"
          ? form.customCategory
          : form.category;

      /*
       * Save custom category if necessary.
       */
      if (
        form.category ===
          "Other" &&
        form.customCategory.trim() !==
          ""
      ) {
        const {
          error:
            categoryError,
        } = await supabase
          .from(
            "pending_categories"
          )
          .insert([
            {
              name:
                form.customCategory.trim(),
            },
          ]);

        if (
          categoryError
        ) {
          console.warn(
            "Pending category could not be saved:",
            categoryError
          );
        }
      }

      /*
       * Upload images.
       */
      let logoUrl =
        "";

      let coverUrl =
        "";

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

      /*
       * Save business.
       *
       * owner remains the human-readable owner name.
       * owner_id links the business to the authenticated
       * Supabase user.
       */
      const {
        error,
      } = await supabase
        .from("business")
        .insert([
          {
            name:
              form.name,

            owner:
              form.owner,

            owner_id:
              user.id,

            category:
              finalCategory,

            phone:
              form.phone,

            email:
              form.email,

            description:
              form.description,

            area:
              form.area,

            landmark:
              form.landmark,

            logo:
              logoUrl,

            cover_image:
              coverUrl,

            website:
              form.website,

            whatsapp:
              form.whatsapp,

            latitude:
              Number(
                form.latitude
              ),

            longitude:
              Number(
                form.longitude
              ),
          },
        ]);

      if (error) {
        console.error(
          "BUSINESS REGISTRATION ERROR:",
          error
        );

        alert(
          error.message
        );

        return;
      }

      alert(
        "Business registered successfully!"
      );

      /*
       * Reset form.
       */
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

      setLogoFile(
        null
      );

      setCoverFile(
        null
      );

      setMapPosition(
        null
      );

      setMapLocationConfirmed(
        false
      );

      setDetectedLocation(
        null
      );

      setLocationStatus(
        ""
      );

      setLocationAccuracy(
        null
      );

      setLocationWarning(
        ""
      );
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
      setLoading(
        false
      );
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
          onSubmit={
            handleSubmit
          }
        >

          <label>
            Business Name
          </label>

          <input
            type="text"
            name="name"
            value={
              form.name
            }
            onChange={
              handleChange
            }
            required
          />

          <label>
            Owner's Name
          </label>

          <input
            type="text"
            name="owner"
            value={
              form.owner
            }
            onChange={
              handleChange
            }
            required
          />

          <label>
            Business Category
          </label>

          <select
            name="category"
            value={
              form.category
            }
            onChange={
              handleChange
            }
            required
          >

            <option value="">
              Select Category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.name
                  }
                >
                  {
                    category.name
                  }
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
            value={
              form.phone
            }
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
            value={
              form.email
            }
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
            value={
              form.area
            }
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

          {/* ==================================================
              LOCATION
          =================================================== */}

          <label>
            Business Location
          </label>

          <p>
            Your device/browser location is
            used only to position the map when
            available. You must select the exact
            business position yourself.
          </p>

          <button
            type="button"
            onClick={
              useCurrentLocation
            }
            disabled={
              loading
            }
          >
            ??{" "}
            {loading
              ? "Detecting Location..."
              : "Use My Current Location"}
          </button>

          {locationStatus && (
            <p className="location-status">
              ??{" "}
              {locationStatus}
            </p>
          )}

          {locationAccuracy !==
            null && (
            <p className="location-accuracy">
              Device/browser accuracy:
              {" "}
              approximately{" "}
              {Math.round(
                locationAccuracy
              )}{" "}
              meters
            </p>
          )}

          {detectedLocation && (
            <div className="register-business-location-status">

              <strong>
                ?? Automatic location source:
              </strong>

              <span>
                {
                  detectedLocation.source
                }
              </span>

            </div>
          )}

          {locationDetecting && (
            <div className="register-business-location-status">
              ?? Detecting your device/browser
              location...
            </div>
          )}

          {locationWarning && (
            <div className="location-warning">
              ??{" "}
              {locationWarning}
            </div>
          )}

          <label>
            Choose Exact Business Location
          </label>

          <p>
            Search for an area such as
            <strong>
              {" "}
              Bambili
            </strong>,
            <strong>
              {" "}
              Bambui
            </strong>,
            <strong>
              {" "}
              Tubah
            </strong>,
            a street or landmark. Then click
            the exact business position on the
            map.
          </p>

          <BusinessLocationPicker
            position={
              mapPosition
            }
            onChange={
              handleMapPositionChange
            }
          />

          {/* ==================================================
              COORDINATES
          =================================================== */}

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
            placeholder="Click the exact location on the map"
            readOnly
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
            placeholder="Click the exact location on the map"
            readOnly
          />

          {mapLocationConfirmed &&
            form.latitude &&
            form.longitude && (
              <p className="location-confirmed">
                ? Exact business map location
                selected
                <br />
                Latitude:
                {" "}
                {form.latitude}
                <br />
                Longitude:
                {" "}
                {form.longitude}
              </p>
          )}

          {!mapLocationConfirmed && (
            <p className="location-warning">
              ?? Please click the exact business
              location on the map or drag the
              marker before registering.
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !mapLocationConfirmed ||
              !form.latitude ||
              !form.longitude
            }
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




