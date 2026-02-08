import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  { name: "Pharmacie Centrale", type: "Pharmacy", address: "12 Rue de la Paix, 75002 Paris", distance: "350m", lat: 48.8698, lng: 2.3302 },
  { name: "Dr. Martin - Cabinet Médical", type: "Doctor", address: "8 Avenue Montaigne, 75008 Paris", distance: "600m", lat: 48.8661, lng: 2.3044 },
  { name: "Hôpital Saint-Louis", type: "Hospital", address: "1 Avenue Claude Vellefaux, 75010 Paris", distance: "1.2km", lat: 48.8735, lng: 2.3691 },
  { name: "Pharmacie du Marais", type: "Pharmacy", address: "45 Rue de Rivoli, 75004 Paris", distance: "800m", lat: 48.8566, lng: 2.3522 },
  { name: "Dr. Leblanc - Cardiologue", type: "Doctor", address: "22 Bd Haussmann, 75009 Paris", distance: "1.5km", lat: 48.8738, lng: 2.3358 },
  { name: "Hôpital Necker", type: "Hospital", address: "149 Rue de Sèvres, 75015 Paris", distance: "3.2km", lat: 48.8466, lng: 2.3153 },
];

const typeColors: Record<string, string> = {
  Pharmacy: "bg-status-good-bg text-status-good",
  Doctor: "bg-secondary text-primary",
  Hospital: "bg-status-alert-bg text-status-alert",
};

export default function NearbyServices() {
  const navigate = useNavigate();

  const openInMaps = (name: string, lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(name)}/@${lat},${lng},15z`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button onClick={() => navigate("/resources")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground mb-2">
          Nearby Services
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-4">Pharmacies, doctors & hospitals near Marie</p>

        {/* Embedded map */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden mb-6 shadow-veille">
          <iframe
            title="Nearby services map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d10500!2d2.3302!3d48.8698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sfr!4v1700000000000!5m2!1sen!2sfr"
            className="w-full h-48 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        {/* Service list */}
        <div className="space-y-3">
          {services.map((service, i) => (
            <motion.button
              key={service.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openInMaps(service.name, service.lat, service.lng)}
              className="w-full rounded-xl bg-card shadow-veille p-4 flex items-center gap-3 text-left hover:shadow-veille-hover transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[service.type]}`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">{service.name}</h3>
                <p className="text-xs text-muted-foreground">{service.address}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs font-semibold text-primary">{service.distance}</span>
                <Navigation className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
