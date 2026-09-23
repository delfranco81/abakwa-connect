import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/core/auth/AuthProvider";
import { supabase } from "@/core/database/supabase";
import { cleaningBookingService } from "@/modules/cleaning/booking/services/CleaningBookingService";
import type {
  CleaningBooking,
  CleaningCategory,
  CleaningServiceDetails,
} from "@/modules/cleaning/booking/types/CleaningBooking";
import "./CleaningBooking.css";


type Provider = Awaited<
  ReturnType<typeof cleaningBookingService.getCleaningProviders>
>[number];

type ProviderService = Awaited<
  ReturnType<typeof cleaningBookingService.getProviderServices>
>[number];

type BookingHistoryItem = CleaningBooking & {
  providerName: string;
};

const categories: CleaningCategory[] = [
  "car-wash",
  "vehicle-detailing",
  "home-cleaning",
  "hotel-cleaning",
  "office-cleaning",
  "laundry",
  "carpet-cleaning",
  "general-cleaning",
  "other-cleaning",
];

const categoryKeys: Record<CleaningCategory, string> = {
  "car-wash": "cleaningCategoryCarWash",
  "vehicle-detailing": "cleaningCategoryVehicleDetailing",
  "home-cleaning": "cleaningCategoryHome",
  "hotel-cleaning": "cleaningCategoryHotel",
  "office-cleaning": "cleaningCategoryOffice",
  laundry: "cleaningCategoryLaundry",
  "carpet-cleaning": "cleaningCategoryCarpet",
  "general-cleaning": "cleaningCategoryGeneral",
  "other-cleaning": "cleaningCategoryOther",
};

const statusKeys: Record<string, string> = {
  pending: "cleaningBookingStatusPending",
  accepted: "cleaningBookingStatusAccepted",
  washing: "cleaningBookingStatusProcessing",
  completed: "cleaningBookingStatusCompleted",
  cancelled: "cleaningBookingStatusCancelled",
};

export default function CleaningBooking() {
  const { t: translations } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const t = (key: string) =>
    translations[key as keyof typeof translations] ?? key;

  const queryBusinessId = searchParams.get("businessId") ?? "";
  const queryServiceId = searchParams.get("serviceId") ?? "";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [history, setHistory] = useState<BookingHistoryItem[]>([]);

  const [selectedProvider, setSelectedProvider] =
    useState(queryBusinessId);
  const [selectedService, setSelectedService] =
    useState(queryServiceId);
  const [category, setCategory] =
    useState<CleaningCategory | "">("");

  const [requirements, setRequirements] = useState("");
  const [details, setDetails] =
    useState<CleaningServiceDetails>({});

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] =
    useState<string[]>([]);

  const [location, setLocation] = useState("");
  const [latitude, setLatitude] =
    useState<number | null>(null);
  const [longitude, setLongitude] =
    useState<number | null>(null);
  const [accuracy, setAccuracy] =
    useState<number | null>(null);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [loadingProviders, setLoadingProviders] =
    useState(true);
  const [loadingServices, setLoadingServices] =
    useState(false);
  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState<CleaningBooking | null>(null);
  const [photoWarning, setPhotoWarning] = useState("");

  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const provider = providers.find(
    (item) => item.id === selectedProvider
  );

  const service = services.find(
    (item) => item.id === selectedService
  );

  useEffect(() => {
    let mounted = true;

    async function loadProviders() {
      try {
        setLoadingProviders(true);

        const result =
          await cleaningBookingService.getCleaningProviders();

        if (mounted) {
          setProviders(result);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(t("cleaningBookingLoadError"));
        }
      } finally {
        if (mounted) {
          setLoadingProviders(false);
        }
      }
    }

    void loadProviders();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProvider) {
      setServices([]);
      setSelectedService("");
      return;
    }

    let mounted = true;

    async function loadServices() {
      try {
        setLoadingServices(true);

        const result =
          await cleaningBookingService.getProviderServices(
            selectedProvider
          );

        if (!mounted) {
          return;
        }

        setServices(result);

        if (
          queryServiceId &&
          result.some(
            (item) => item.id === queryServiceId
          )
        ) {
          setSelectedService(queryServiceId);
        } else if (
          selectedService &&
          !result.some(
            (item) => item.id === selectedService
          )
        ) {
          setSelectedService("");
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(t("cleaningBookingLoadError"));
        }
      } finally {
        if (mounted) {
          setLoadingServices(false);
        }
      }
    }

    void loadServices();

    return () => {
      mounted = false;
    };
  }, [selectedProvider]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    void loadHistory();
  }, [user]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview)
      );
    };
  }, [photoPreviews]);

  async function loadHistory() {
    if (!user) {
      return;
    }

    try {
      setLoadingHistory(true);

      const bookings =
        await cleaningBookingService.customerBookings(
          user.id
        );

      const businessIds = [
        ...new Set(
          bookings
            .map((booking) => booking.businessId)
            .filter(Boolean)
        ),
      ];

      let businessMap: Record<string, string> = {};

      if (businessIds.length > 0) {
        const { data, error: businessError } =
          await supabase
            .from("business")
            .select("id,name")
            .in("id", businessIds);

        if (businessError) {
          throw businessError;
        }

        businessMap = Object.fromEntries(
          (data ?? []).map((item) => [
            item.id,
            item.name ?? t("cleaningBookingProvider"),
          ])
        );
      }

      setHistory(
        bookings.map((booking) => ({
          ...booking,
          providerName:
            businessMap[booking.businessId] ??
            t("cleaningBookingProvider"),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }

  function updateDetail(
    key: string,
    value: unknown
  ) {
    setDetails((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handlePhotos(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const selected = Array.from(
      event.target.files ?? []
    );

    const validFiles: File[] = [];

    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setError(t("cleaningBookingInvalidImage"));
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(t("cleaningBookingImageTooLarge"));
        continue;
      }

      validFiles.push(file);
    }

    setPhotos((current) => [
      ...current,
      ...validFiles,
    ]);

    setPhotoPreviews((current) => [
      ...current,
      ...validFiles.map((file) =>
        URL.createObjectURL(file)
      ),
    ]);

    event.target.value = "";
  }

  function removePhoto(index: number) {
    const preview = photoPreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPhotos((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );

    setPhotoPreviews((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setError(
        t("cleaningBookingLocationUnavailable")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setError("");
      },
      () => {
        setError(
          t("cleaningBookingLocationUnavailable")
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  function validateForm() {
    if (!user) {
      return t("cleaningBookingLoginRequired");
    }

    if (!selectedProvider) {
      return t("cleaningBookingSelectProvider");
    }

    if (!selectedService) {
      return t("cleaningBookingSelectService");
    }

    if (!category) {
      return t("cleaningBookingSelectCategory");
    }

    if (!requirements.trim()) {
      return t(
        "cleaningBookingRequirementsRequired"
      );
    }

    if (!bookingDate || !bookingTime) {
      return t("cleaningBookingDateTimeRequired");
    }

    if (!location.trim()) {
      return t("cleaningBookingLocationRequired");
    }

    if (!contactPhone.trim()) {
      return t("cleaningBookingPhoneRequired");
    }

    if (!service) {
      return t("cleaningBookingSelectService");
    }

    return "";
  }

  function handleReview() {
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setReviewing(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleConfirm() {
    if (!user || !service || !category) {
      return;
    }

    setError("");
    setPhotoWarning("");
    setSubmitting(true);

    try {
      const mapsUrl =
        latitude !== null &&
        longitude !== null
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : null;

      const booking =
        await cleaningBookingService.createBooking({
          id: crypto.randomUUID(),
          customerId: user.id,
          businessId: selectedProvider,
          washingPointId: null,
          washingServiceId: "",
          cleaningCategory: category,
          cleaningRequirements:
            requirements.trim(),
          serviceDetails: {
            ...details,
            businessServiceId: service.id,
            serviceName: service.service_name,
          },
          customerPhotos: [],
          bookingDate,
          bookingTime,
          location: location.trim(),
          locationLatitude: latitude,
          locationLongitude: longitude,
          locationAccuracy: accuracy,
          googleMapsUrl: mapsUrl,
          customerNotes: customerNotes.trim(),
          contactPhone: contactPhone.trim(),
          amount: Number(service.price ?? 0),
          status: "pending",
          createdAt: new Date().toISOString(),
        });

      if (photos.length > 0) {
        try {
          await cleaningBookingService.uploadCustomerPhotos(
            user.id,
            booking.id,
            photos
          );
        } catch (photoError) {
          console.error(photoError);

          setPhotoWarning(
            t("cleaningBookingPhotoUploadWarning")
          );
        }
      }

      setSuccess(booking);
      setReviewing(false);

      await loadHistory();
    } catch (err) {
      console.error(err);
      setError(
        t("cleaningBookingCreateError")
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteBooking(
    bookingId: string
  ) {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      t("cleaningBookingDeleteConfirm")
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const { error: deleteError } =
        await supabase
          .from("bookings")
          .delete()
          .eq("id", bookingId)
          .eq("customer_id", user.id)
          .not("cleaning_category", "is", null);

      if (deleteError) {
        throw deleteError;
      }

      setHistory((current) =>
        current.filter(
          (booking) => booking.id !== bookingId
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        t("cleaningBookingDeleteError")
      );
    }
  }

  function startNewBooking() {
    setSuccess(null);
    setReviewing(false);
    setError("");
    setPhotoWarning("");
    setRequirements("");
    setDetails({});
    setPhotos([]);
    setPhotoPreviews([]);
    setLocation("");
    setLatitude(null);
    setLongitude(null);
    setAccuracy(null);
    setBookingDate("");
    setBookingTime("");
    setCustomerNotes("");
  }

  if (success) {
    const whatsappNumber = provider?.phone
      ? provider.phone.replace(/[^\d]/g, "")
      : "";

    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          `${t(
            "cleaningBookingWhatsAppMessage"
          )} ${success.id}`
        )}`
      : "";

    return (
      <main className="cleaning-booking-page">
        <div className="cleaning-booking-shell">
          <section className="cleaning-booking-success">
            <div className="cleaning-booking-success-icon">
              OK
            </div>

            <span className="cleaning-booking-eyebrow">
              {t("cleaningBookingEyebrow")}
            </span>

            <h1>
              {t("cleaningBookingSuccessTitle")}
            </h1>

            <p>
              {t(
                "cleaningBookingSuccessDescription"
              )}
            </p>

            <div className="cleaning-booking-reference">
              <span>
                {t("cleaningBookingReference")}
              </span>
              <strong>{success.id}</strong>
            </div>

            {photoWarning && (
              <div className="cleaning-booking-warning">
                {photoWarning}
              </div>
            )}

            <div className="cleaning-booking-success-actions">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cleaning-booking-primary-button"
                >
                  {t(
                    "cleaningBookingWhatsAppProvider"
                  )}
                </a>
              )}

              <button
                type="button"
                className="cleaning-booking-secondary-button"
                onClick={startNewBooking}
              >
                {t(
                  "cleaningBookingNewBooking"
                )}
              </button>
            </div>
          </section>

          <BookingHistory
            history={history}
            loading={loadingHistory}
            onDelete={deleteBooking}
            t={t}
          />
        </div>
      </main>
    );
  }

  if (reviewing) {
    return (
      <main className="cleaning-booking-page">
        <div className="cleaning-booking-shell">
          <header className="cleaning-booking-header">
            <span className="cleaning-booking-eyebrow">
              {t("cleaningBookingReviewEyebrow")}
            </span>
            <h1>
              {t("cleaningBookingReviewTitle")}
            </h1>
            <p>
              {t(
                "cleaningBookingReviewDescription"
              )}
            </p>
          </header>

          {error && (
            <div
              className="cleaning-booking-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <section className="cleaning-booking-preview">
            <PreviewRow
              label={t(
                "cleaningBookingCategoryLabel"
              )}
              value={
                category
                  ? t(categoryKeys[category])
                  : "-"
              }
            />

            <PreviewRow
              label={t(
                "cleaningBookingProviderLabel"
              )}
              value={
                provider?.name ??
                t("cleaningBookingProvider")
              }
            />

            <PreviewRow
              label={t(
                "cleaningBookingServiceLabel"
              )}
              value={
                service?.service_name ??
                t("cleaningBookingChooseService")
              }
            />

            <PreviewRow
              label={t(
                "cleaningBookingRequirementsLabel"
              )}
              value={requirements}
              multiline
            />

            {Object.keys(details).filter(
              (key) =>
                ![
                  "businessServiceId",
                  "serviceName",
                ].includes(key) &&
                details[key] !== undefined &&
                details[key] !== ""
            ).length > 0 && (
              <div className="cleaning-booking-preview-details">
                <h3>
                  {t(
                    "cleaningBookingDetailsLabel"
                  )}
                </h3>

                {Object.entries(details)
                  .filter(
                    ([key, value]) =>
                      ![
                        "businessServiceId",
                        "serviceName",
                      ].includes(key) &&
                      value !== undefined &&
                      value !== ""
                  )
                  .map(([key, value]) => (
                    <PreviewRow
                      key={key}
                      label={key}
                      value={String(value)}
                    />
                  ))}
              </div>
            )}

            {photos.length > 0 && (
              <div className="cleaning-booking-preview-photos">
                <h3>
                  {t(
                    "cleaningBookingPhotosLabel"
                  )}
                </h3>

                <div className="cleaning-booking-photo-grid">
                  {photoPreviews.map(
                    (preview) => (
                      <img
                        key={preview}
                        src={preview}
                        alt=""
                      />
                    )
                  )}
                </div>
              </div>
            )}

            <PreviewRow
              label={t(
                "cleaningBookingLocationLabel"
              )}
              value={location}
              multiline
            />

            <PreviewRow
              label={t(
                "cleaningBookingDateTimeLabel"
              )}
              value={`${bookingDate} ${bookingTime}`}
            />

            <PreviewRow
              label={t(
                "cleaningBookingPhoneLabel"
              )}
              value={contactPhone}
            />

            {customerNotes && (
              <PreviewRow
                label={t(
                  "cleaningBookingNotesLabel"
                )}
                value={customerNotes}
                multiline
              />
            )}

            <PreviewRow
              label={t(
                "cleaningBookingPriceLabel"
              )}
              value={`${Number(
                service?.price ?? 0
              ).toLocaleString()} ${
                service?.currency ??
                t("cleaningBookingCurrency")
              }`}
            />

            {service?.duration_minutes && (
              <PreviewRow
                label={t(
                  "cleaningBookingDurationLabel"
                )}
                value={`${service.duration_minutes} ${t(
                  "cleaningBookingMinutes"
                )}`}
              />
            )}
          </section>

          <div className="cleaning-booking-preview-actions">
            <button
              type="button"
              className="cleaning-booking-secondary-button"
              onClick={() => setReviewing(false)}
              disabled={submitting}
            >
              {t("cleaningBookingEdit")}
            </button>

            <button
              type="button"
              className="cleaning-booking-primary-button"
              onClick={() => void handleConfirm()}
              disabled={submitting}
            >
              {submitting
                ? t("cleaningBookingSubmitting")
                : t(
                    "cleaningBookingConfirm"
                  )}
            </button>
          </div>

          <BookingHistory
            history={history}
            loading={loadingHistory}
            onDelete={deleteBooking}
            t={t}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="cleaning-booking-page">
      <div className="cleaning-booking-shell">
        <header className="cleaning-booking-header">
          <span className="cleaning-booking-eyebrow">
            {t("cleaningBookingEyebrow")}
          </span>

          <h1>{t("cleaningBookingTitle")}</h1>

          <p>
            {t("cleaningBookingSubtitle")}
          </p>
        </header>

        {error && (
          <div
            className="cleaning-booking-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          className="cleaning-booking-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleReview();
          }}
        >
          <section className="cleaning-booking-card">
            <BookingSectionTitle
              number="1"
              title={t(
                "cleaningBookingServiceSection"
              )}
              description={t(
                "cleaningBookingServiceSectionHint"
              )}
            />

            <div className="cleaning-booking-grid">
              <label>
                <span>
                  {t(
                    "cleaningBookingCategoryLabel"
                  )}
                </span>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value as
                        | CleaningCategory
                        | ""
                    )
                  }
                >
                  <option value="">
                    {t(
                      "cleaningBookingChooseCategory"
                    )}
                  </option>

                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {t(categoryKeys[item])}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>
                  {t(
                    "cleaningBookingProviderLabel"
                  )}
                </span>

                <select
                  value={selectedProvider}
                  onChange={(event) => {
                    setSelectedProvider(
                      event.target.value
                    );
                    setSelectedService("");
                  }}
                  disabled={loadingProviders}
                >
                  <option value="">
                    {loadingProviders
                      ? t(
                          "cleaningBookingLoading"
                        )
                      : t(
                          "cleaningBookingChooseProvider"
                        )}
                  </option>

                  {providers.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="cleaning-booking-full-grid">
                <span>
                  {t(
                    "cleaningBookingServiceLabel"
                  )}
                </span>

                <select
                  value={selectedService}
                  onChange={(event) =>
                    setSelectedService(
                      event.target.value
                    )
                  }
                  disabled={
                    !selectedProvider ||
                    loadingServices
                  }
                >
                  <option value="">
                    {loadingServices
                      ? t(
                          "cleaningBookingLoading"
                        )
                      : t(
                          "cleaningBookingChooseService"
                        )}
                  </option>

                  {services.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.service_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="cleaning-booking-card">
            <BookingSectionTitle
              number="2"
              title={t(
                "cleaningBookingRequirementsSection"
              )}
              description={t(
                "cleaningBookingRequirementsSectionHint"
              )}
            />

            <label className="cleaning-booking-full-field">
              <span>
                {t(
                  "cleaningBookingRequirementsLabel"
                )}
              </span>

              <textarea
                value={requirements}
                onChange={(event) =>
                  setRequirements(
                    event.target.value
                  )
                }
                placeholder={t(
                  "cleaningBookingRequirementsPlaceholder"
                )}
                rows={6}
              />
            </label>

            <div className="cleaning-booking-ai">
              <div>
                <strong>
                  {t("cleaningBookingAITitle")}
                </strong>

                <p>
                  {t(
                    "cleaningBookingAIDescription"
                  )}
                </p>
              </div>

              <span>
                {t("cleaningBookingAIStatus")}
              </span>
            </div>
          </section>

          {category && (
            <section className="cleaning-booking-card">
              <BookingSectionTitle
                number="3"
                title={t(
                  "cleaningBookingDetailsSection"
                )}
                description={t(
                  "cleaningBookingDetailsSectionHint"
                )}
              />

              {(category === "car-wash" ||
                category ===
                  "vehicle-detailing") && (
                <div className="cleaning-booking-grid">
                  <label>
                    <span>
                      {t(
                        "cleaningBookingVehicleType"
                      )}
                    </span>

                    <select
                      value={String(
                        details.vehicleType ?? ""
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "vehicleType",
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        {t(
                          "cleaningBookingChooseVehicle"
                        )}
                      </option>
                      <option value="sedan">
                        Sedan
                      </option>
                      <option value="suv">
                        SUV
                      </option>
                      <option value="pickup">
                        Pickup
                      </option>
                      <option value="truck">
                        Truck
                      </option>
                      <option value="motorcycle">
                        Motorcycle
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>
                      {t(
                        "cleaningBookingCondition"
                      )}
                    </span>

                    <input
                      value={String(
                        details.condition ?? ""
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "condition",
                          event.target.value
                        )
                      }
                      placeholder={t(
                        "cleaningBookingConditionPlaceholder"
                      )}
                    />
                  </label>
                </div>
              )}

              {(category ===
                "home-cleaning" ||
                category ===
                  "hotel-cleaning" ||
                category ===
                  "office-cleaning") && (
                <div className="cleaning-booking-grid">
                  <label>
                    <span>
                      {t(
                        "cleaningBookingPropertyType"
                      )}
                    </span>

                    <input
                      value={String(
                        details.propertyType ?? ""
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "propertyType",
                          event.target.value
                        )
                      }
                      placeholder={t(
                        "cleaningBookingPropertyTypePlaceholder"
                      )}
                    />
                  </label>

                  <label>
                    <span>
                      {t(
                        "cleaningBookingRooms"
                      )}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={String(
                        details.rooms ?? ""
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "rooms",
                          event.target.value
                            ? Number(
                                event.target.value
                              )
                            : undefined
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      {t(
                        "cleaningBookingAreaSize"
                      )}
                    </span>

                    <input
                      value={String(
                        details.areaSize ?? ""
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "areaSize",
                          event.target.value
                        )
                      }
                      placeholder={t(
                        "cleaningBookingAreaSizePlaceholder"
                      )}
                    />
                  </label>
                </div>
              )}

              {(category === "laundry" ||
                category ===
                  "carpet-cleaning") && (
                <div className="cleaning-booking-grid">
                  <label>
                    <span>
                      {t(
                        "cleaningBookingItemCount"
                      )}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={String(
                        details.itemCount ?? ""
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "itemCount",
                          event.target.value
                            ? Number(
                                event.target.value
                              )
                            : undefined
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      {t(
                        "cleaningBookingWeight"
                      )}
                    </span>

                    <input
                      value={String(
                        details.weight ?? ""
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "weight",
                          event.target.value
                        )
                      }
                      placeholder={t(
                        "cleaningBookingWeightPlaceholder"
                      )}
                    />
                  </label>

                  <label className="cleaning-booking-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(
                        details.pickupRequired
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "pickupRequired",
                          event.target.checked
                        )
                      }
                    />
                    <span>
                      {t(
                        "cleaningBookingPickup"
                      )}
                    </span>
                  </label>

                  <label className="cleaning-booking-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(
                        details.deliveryRequired
                      )}
                      onChange={(event) =>
                        updateDetail(
                          "deliveryRequired",
                          event.target.checked
                        )
                      }
                    />
                    <span>
                      {t(
                        "cleaningBookingDelivery"
                      )}
                    </span>
                  </label>
                </div>
              )}

              {(category ===
                "general-cleaning" ||
                category ===
                  "other-cleaning") && (
                <label className="cleaning-booking-full-field">
                  <span>
                    {t(
                      "cleaningBookingAdditionalDetails"
                    )}
                  </span>

                  <textarea
                    value={String(
                      details.additionalDetails ??
                        ""
                    )}
                    onChange={(event) =>
                      updateDetail(
                        "additionalDetails",
                        event.target.value
                      )
                    }
                    placeholder={t(
                      "cleaningBookingAdditionalDetailsPlaceholder"
                    )}
                    rows={4}
                  />
                </label>
              )}
            </section>
          )}

          <section className="cleaning-booking-card">
            <BookingSectionTitle
              number="4"
              title={t(
                "cleaningBookingPhotosSection"
              )}
              description={t(
                "cleaningBookingPhotosHint"
              )}
            />

            <label className="cleaning-booking-photo-upload">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                multiple
                onChange={handlePhotos}
              />

              <strong>
                {t(
                  "cleaningBookingAddPhotos"
                )}
              </strong>

              <span>
                {t(
                  "cleaningBookingPhotoUploadHint"
                )}
              </span>
            </label>

            {photoPreviews.length > 0 && (
              <div className="cleaning-booking-photo-grid">
                {photoPreviews.map(
                  (preview, index) => (
                    <div
                      className="cleaning-booking-photo"
                      key={preview}
                    >
                      <img
                        src={preview}
                        alt=""
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removePhoto(index)
                        }
                      >
                        X
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          <section className="cleaning-booking-card">
            <BookingSectionTitle
              number="5"
              title={t(
                "cleaningBookingLocationSection"
              )}
              description={t(
                "cleaningBookingLocationHint"
              )}
            />

            <label className="cleaning-booking-full-field">
              <span>
                {t(
                  "cleaningBookingLocationLabel"
                )}
              </span>

              <input
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder={t(
                  "cleaningBookingLocationPlaceholder"
                )}
              />
            </label>

            <button
              type="button"
              className="cleaning-booking-location-button"
              onClick={captureLocation}
            >
              {t(
                "cleaningBookingUseLocation"
              )}
            </button>

            {latitude !== null &&
              longitude !== null && (
                <div className="cleaning-booking-location-status">
                  {t(
                    "cleaningBookingLocationCaptured"
                  )}
                </div>
              )}
          </section>

          <section className="cleaning-booking-card">
            <BookingSectionTitle
              number="6"
              title={t(
                "cleaningBookingScheduleSection"
              )}
              description={t(
                "cleaningBookingScheduleHint"
              )}
            />

            <div className="cleaning-booking-grid">
              <label>
                <span>
                  {t(
                    "cleaningBookingDateLabel"
                  )}
                </span>

                <input
                  type="date"
                  min={today}
                  value={bookingDate}
                  onChange={(event) =>
                    setBookingDate(
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  {t(
                    "cleaningBookingTimeLabel"
                  )}
                </span>

                <input
                  type="time"
                  value={bookingTime}
                  onChange={(event) =>
                    setBookingTime(
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </section>

          <section className="cleaning-booking-card">
            <BookingSectionTitle
              number="7"
              title={t(
                "cleaningBookingContactSection"
              )}
              description={t(
                "cleaningBookingContactHint"
              )}
            />

            <label className="cleaning-booking-full-field">
              <span>
                {t(
                  "cleaningBookingPhoneLabel"
                )}
              </span>

              <input
                type="tel"
                value={contactPhone}
                onChange={(event) =>
                  setContactPhone(
                    event.target.value
                  )
                }
                placeholder={t(
                  "cleaningBookingPhonePlaceholder"
                )}
              />
            </label>

            <label className="cleaning-booking-full-field">
              <span>
                {t(
                  "cleaningBookingNotesLabel"
                )}
              </span>

              <textarea
                value={customerNotes}
                onChange={(event) =>
                  setCustomerNotes(
                    event.target.value
                  )
                }
                placeholder={t(
                  "cleaningBookingNotesPlaceholder"
                )}
                rows={4}
              />
            </label>
          </section>

          <div className="cleaning-booking-submit-bar">
            <div>
              <span>
                {t(
                  "cleaningBookingReadyToReview"
                )}
              </span>

              <strong>
                {service?.service_name ??
                  t(
                    "cleaningBookingChooseService"
                  )}
              </strong>
            </div>

            <button
              type="submit"
              className="cleaning-booking-primary-button"
            >
              {t(
                "cleaningBookingReviewButton"
              )}
            </button>
          </div>
        </form>

        <BookingHistory
          history={history}
          loading={loadingHistory}
          onDelete={deleteBooking}
          t={t}
        />
      </div>
    </main>
  );
}

function BookingSectionTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="cleaning-booking-section-heading">
      <span>{number}</span>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function PreviewRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="cleaning-booking-preview-row">
      <span>{label}</span>
      <strong
        className={
          multiline
            ? "cleaning-booking-preview-multiline"
            : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function BookingHistory({
  history,
  loading,
  onDelete,
  t,
}: {
  history: BookingHistoryItem[];
  loading: boolean;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <section className="cleaning-booking-history">
      <div className="cleaning-booking-history-heading">
        <div>
          <span className="cleaning-booking-eyebrow">
            {t(
              "cleaningBookingHistoryEyebrow"
            )}
          </span>

          <h2>
            {t("cleaningBookingHistoryTitle")}
          </h2>
        </div>
      </div>

      {loading ? (
        <p className="cleaning-booking-history-empty">
          {t("cleaningBookingLoadingHistory")}
        </p>
      ) : history.length === 0 ? (
        <p className="cleaning-booking-history-empty">
          {t(
            "cleaningBookingNoHistory"
          )}
        </p>
      ) : (
        <div className="cleaning-booking-history-list">
          {history.map((booking) => (
            <article
              key={booking.id}
              className="cleaning-booking-history-item"
            >
              <div>
                <strong>
                  {String(
                    booking.serviceDetails.serviceName ??
                    t(
                      categoryKeys[
                        booking.cleaningCategory
                      ]
                    )
                  )}
                </strong>

                <span>
                  {booking.providerName}
                </span>

                <small>
                  {booking.bookingDate}{" "}
                  {booking.bookingTime}
                </small>
              </div>

              <div className="cleaning-booking-history-meta">
                <span className="cleaning-booking-status">
                  {t(
                    statusKeys[
                      booking.status
                    ] ??
                      "cleaningBookingStatusPending"
                  )}
                </span>

                <strong>
                  {Number(
                    booking.amount
                  ).toLocaleString()}{" "}
                  {t(
                    "cleaningBookingCurrency"
                  )}
                </strong>

                <button
                  type="button"
                  className="cleaning-booking-delete"
                  onClick={() =>
                    onDelete(booking.id)
                  }
                >
                  {t(
                    "cleaningBookingDelete"
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}








