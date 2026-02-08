import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Phone, User, Pill, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const steps = [
  { title: "Emergency Contact", subtitle: "Who should we call if something's wrong?" },
  { title: "Your Account", subtitle: "Keep it simple — just your name and a PIN" },
  { title: "A Little About You", subtitle: "This helps your companion know you better" },
];

export default function ElderSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  // Step 2
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  // Step 3
  const [age, setAge] = useState("");
  const [medications, setMedications] = useState("");

  const relationships = ["Son", "Daughter", "Grandson", "Granddaughter", "Other"];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else navigate("/elder-home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-[#F7F3FF] to-[#EAF7FF] flex flex-col">
      <div className="max-w-sm mx-auto w-full px-6 pt-14 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : navigate("/welcome"))}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex gap-1.5 flex-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-2xl font-extrabold text-foreground">
              {steps[step].title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              {steps[step].subtitle}
            </p>

            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Their name</label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Sophie"
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Phone number</label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Relationship</label>
                  <div className="flex flex-wrap gap-2">
                    {relationships.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRelationship(r)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          relationship === r
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Your first name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marie"
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Choose a 4-digit PIN
                  </label>
                  <Input
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="• • • •"
                    className="rounded-xl h-12 text-center text-xl tracking-[0.5em] font-bold"
                    inputMode="numeric"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Your age</label>
                  <Input
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="78"
                    inputMode="numeric"
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Medications (optional)
                  </label>
                  <Input
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="e.g. Metformin, Aspirin"
                    className="rounded-xl h-12"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This stays private — your companion just uses it for gentle reminders.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="py-8">
          <Button
            onClick={handleNext}
            className="w-full h-12 rounded-xl text-base font-bold"
          >
            {step === 2 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                All done!
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
