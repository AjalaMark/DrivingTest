import mongoose from "mongoose";
export const uri =
  "mongodb+srv://dishant674:waterloo@dishant.mmzcaee.mongodb.net/drive_test?retryWrites=true&w=majority";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("there was an error" + error);
  });

  const userSchema = mongoose.Schema({
    firstName: { type: String, default: "default" },
    lastName: { type: String, default: "default" },
    age: { type: Number, default: 0 },
    userName: { type: String, require: true },
    password: { type: String, require: true },
    userType: { type: String, default: null },
    licenseNumber: { type: String, default: "Default" },
    dateOfBirth: { type: String, default: "Default" },
    carDetails: {
      carMake: { type: String, default: "default" },
      carModel: { type: String, default: "default" },
      carYear: { type: String, default: "Default" },
      plateNumber: { type: String, default: "Default" },
    },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    testType: { type: String, default: null },
    comment: { type: String, default: null },
    isTestPassed: { type: Boolean, default: null },
  });
  
  const appointmentSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "userData"},
    date: { type: Date, required: true },
    time: { type: String, required: true },
    isTimeSlotAvailable: { type: Boolean, default: true },
  });

const appointmentModel = mongoose.model("Appointment", appointmentSchema);

const userModel = mongoose.model("userData", userSchema);

export { userModel, appointmentModel };
