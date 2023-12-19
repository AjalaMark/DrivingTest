import bcrypt from "bcrypt";
import { userModel, appointmentModel } from "../models/userModel.js";

class Controller {
  static get_dashboard = (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
      return res.redirect("login");
    }
    res.render("dashboard");
  };
  static get_login = (req, res) => {
    res.render("login", { message: null });
  };
  static post_login = async (req, res) => {
    // try {
    //   const formData = req.body;
    //   const userMatched = await userModel.findOne({
    //     userName: formData.userName,
    //   });

    //   if (!userMatched) {
    //     res.redirect("/signup");
    //     console.log("user does not exist");
    //   } else {
    //     const passwordMatched = await bcrypt.compare(
    //       formData.password,
    //       userMatched.password
    //     );
    //     if (passwordMatched) {
    //       req.session.userId = userMatched._id;
    //       req.session.userType = userMatched.userType;

    //       console.log(
    //         "Session Variables set:",
    //         req.session.userId,
    //         req.session.userType
    //       );

    //       console.log("req.session:", req.session);

    //       console.log("Redirecting to /dashboard");
    //       res.redirect("/dashboard");
    //     } else {
    //       console.log("password did not match");
    //       res.send("password did not match");
    //     }
    //   }
    // } catch (error) {
    //   console.log(`The error below was encountered \n ${error}`);
    // }

    try {
      const formBody = req.body;
      const userName = formBody.userName;
      const password = formBody.password;

      if (userName === "") {
        return res.render("login", {
          message: "Please enter the username",
        });
      }

      if (password === "") {
        return res.render("login", {
          message: "Please enter password",
        });
      }

      const user = await userModel.findOne({ userName }).exec();

      if (!user) {
        console.log("This user does not exist, please register");
        return res.render("login", {
          message: "User does not exist",
        });
      }

      if (!bcrypt.compareSync(password, user.password)) {
        console.log("Password is not correct");
        return res.render("login", {
          message: "Password is not correct",
        });
      }

      req.session.user_id = user._id;
      req.session.user_UserType = user.userType;

      const firstLogin = user.firstName === "default";
      req.session.save(()=>{
        
      })
      if (req.session.user_UserType === "Driver") {
        if (!firstLogin) {
          res.redirect("/dashboard");
          console.log("redirecting to dashboard");
        } else {
          res.locals.user_UserType = req.session.user_UserType || null;
          console.log("User Type in middleware:", res.locals.user_UserType);
          res.render("g2page", {
            message: "Welcome to DriveTest, Fill the g2 information",
          });

          console.log("Login Success");
          console.log(req.session);
        }
      }

      if (
        req.session.user_UserType === "Admin"
      ) {
        res.locals.user_UserType = req.session.user_UserType || null;
        res.redirect("/appointment");
      }

      if (
        req.session.user_UserType === "Examiner"
      ) {
        res.locals.user_UserType = req.session.user_UserType || null;
        res.redirect("/examiner");
      }

      
    } catch (error) {
      console.error(error);
      res.status(500).send("Error during login");
    }
  };

  static logout_post = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error destroying session");
      } else {
        res.redirect("/login");
      }
    });
  };

  static post_signup = async (req, res) => {
    // try {
    //   const formData = req.body;
    //   console.log(formData);
    //   const userMatched = await userModel.findOne({
    //     username: formData.username,
    //   });
    //   if (!userMatched) {
    //     const hashedPassword = await bcrypt.hash(formData.password, 12);
    //     console.log(hashedPassword);

    //     const userToSave = new userModel({
    //       userName: formData.username,
    //       password: hashedPassword,
    //       userType: formData.userType,
    //     });

    //     const userSaved = await userToSave.save();
    //     res.redirect("/login");
    //   }
    // } catch (error) {
    //   console.log(`The error below was encountered \n ${error}`);
    // }
    try {
      const formData = req.body;

      const userMatched = await userModel.findOne({
        userName: formData.userName,
      });

      console.log(formData.userName);

      if (!userMatched) {
        const hashedPassword = await bcrypt.hash(formData.password, 12);
        if (formData.password !== formData.confirmPassword) {
          return res.render("login", {
            message: "Password Not Matched",
          });
        }

        const userToAdd = new userModel({
          userName: formData.userName,
          password: hashedPassword,
          userType: formData.userType,
        });

        await userToAdd.save();

        res.render("login", {
          message: "Registration Successful, Please Login !!!",
        });
      } else {
        res.render("login", {
          message: "User already Exists",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error adding user");
    }
  };

static get_g2page = async (req, res) => {
  try {
    const userId = req.session.user_id;
    if (!userId) {
      return res.redirect("login");
    }

    const data = await userModel.findOne({ _id: userId }).exec();

    const userHasAppointment = await appointmentModel.find({
      user: data._id,
    });

    // Check if a date is selected
    const selectedDate = req.query.date;

    // If a date is selected, fetch available appointments
    let availableAppointments = [];
    if (selectedDate) {
      availableAppointments = await appointmentModel.find({
        date: selectedDate,
        isTimeSlotAvailable: true,
      });
    }

    

    res.render("g2page", {
      data,
      availableAppointments,
      selectedDate,
      userHasAppointment: userHasAppointment,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Error rendering g2page");
  }
};




  static post_g2page = async (req, res) => {
    // try {
    //   const formData = req.body;

    //   const userUpdateDB = await userModel.findByIdAndUpdate(
    //     req.session.userId,
    //     {
    //       firstName: formData.firstName,
    //       lastName: formData.lastName,
    //       age: formData.age,
    //       licenseNumber: formData.licenseNumber,
    //       dateOfBirth: formData.dateOfBirth,
    //       carDetails: {
    //         carMake: formData.carMake,
    //         carModel: formData.carModel,
    //         carYear: formData.carYear,
    //         plateNumber: formData.plateNumber,
    //       },
    //     }
    //   );

    //   if (!userUpdateDB) {
    //     console.log("User data update failed");
    //     res.send("errorPage");
    //     return;
    //   }

    //   console.log("User data updated successfully");
    //   res.redirect("/dashboard");
    // } catch (error) {
    //   console.log(`An error was encountered \n ${error}`);
    //   res.render("errorPage"); // Render an error page if needed
    // }

    try {
      const userId = req.session.user_id;
      if (!userId) {
        return res.redirect("login");
      }
      const user = await userModel.findById(userId).exec();

      const form_data = req.body;

      user.licenseNumber = form_data.licenseNumber;
      user.firstName = form_data.firstName;
      user.lastName = form_data.lastName;
      user.email = form_data.email;
      user.age = form_data.age;
      user.dateOfBirth = form_data.dateOfBirth;
      user.carDetails.carMake = form_data.carMake;
      user.carDetails.carModel = form_data.carModel;
      user.carDetails.carYear = form_data.carYear;
      user.carDetails.plateNumber = form_data.plateNumber;

      const userType = await userModel.findByIdAndUpdate(userId, {
        testType: "G2",
      });

      const g2_user = await user.save();

      console.log(g2_user);
      console.log(userType)

      res.redirect("/gpage");
    } catch (err) {
      console.log(` can not add cars due to this error below \n ${err}`);
    }
  };

  static get_gpage = async (req, res) => {
    // try {
    //   if (req.session.userId) {
    //     // Check your condition here, for example:
    //     // Assuming userType "Driver" has access to gpage
    //     if (req.session.userType === "Driver") {
    //       const formData = req.query.licenseNumber;
    //       console.log(formData);
    //       const userFromDB = await userModel.findOne({
    //         licenseNumber: formData,
    //       });
    //       console.log(userFromDB);
    //       res.render("gpage", { userFromDB, formData });
    //     } else {
    //       console.log("You do not meet the requirements");
    //       res.redirect("/dashboard");
    //     }
    //   } else {
    //     console.log("You are not logged in");
    //     res.redirect("/login");
    //   }
    // } catch (error) {
    //   console.log(`An error was encountered \n ${error}`);
    //   res.render("errorPage");
    // }
    const userId = req.session.user_id;
    if (!userId) {
      return res.redirect("login");
    }
    const data = await userModel.findOne({ _id: userId }).exec();

    res.render("gpage", { data: data });
  };

  static post_gpage = async (req, res) => {
    const userId = req.session.user_id;
    try {
      const formData = req.body;
      const userUpdateDB = await userModel.findByIdAndUpdate(userId, {
        carDetails: {
          carMake: formData.carMake,
          carModel: formData.carModel,
          carYear: formData.carYear,
          plateNumber: formData.plateNumber,
        },
        testType: "G",
      });
   
      res.render("g2page");
    } catch (error) {
      console.log(`an error was encountered \n ${error}`);
    }
  };

  static get_appointment = async (req, res) => {
    try {
      const userData = await userModel.find({})
      const existingAppointments = await appointmentModel.find({});
      const { date, time } = req.query;

      res.render("appointment", { existingAppointments, userData, date, time });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching appointments");
    }
  };

  static post_appointment = async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      res.render("appointment", {
        message: "Please select both date and time",
      });
      return;
    }

    const existingAppointment = await appointmentModel.findOne({
      date,
      time,
    });

    if (existingAppointment) {
      if (existingAppointment.isTimeSlotAvailable) {
        return res.render("appointment", {
          existingAppointment: [existingAppointment],
          message: "Appointment date has already been added",
          date,
          time,
        });
      }
    }

    // Save the appointment to the database
    const newAppointment = new appointmentModel({ date, time, isTimeSlotAvailable: true });
    await newAppointment.save();

    console.log(`New Appointment added: ${newAppointment}`);
    
    res.redirect("/appointment");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding appointment");
  }
};



// Modify the controller method to handle the booking logic
static post_bookAppointment = async (req, res) => {
  try {
    const { appointmentId, selectedDate } = req.body;
    // Find the appointment by ID
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.render("appointment", { message: 'Appointment not found.' });
    }

    if (!appointment.isTimeSlotAvailable) {
      return res.render("appointment", { message: 'Appointment already booked.' });
    }

    if (!selectedDate) {
      return res.status(400).json({ success: false, message: 'Date is undefined.' });
    }

   
    appointment.isTimeSlotAvailable = false;

    appointment.user = req.session.user_id

    await appointmentModel.findByIdAndUpdate(appointmentId, appointment);
  
    res.redirect(`/g2page?date=${selectedDate}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

static get_examiner = async (req, res) => {
  try {
    const userId = req.session.user_id;
    if (!userId) {
      return res.redirect("login");
    }
    const testType = req.query.testType || "all"
    const appointments = await appointmentModel.find({});
    const users = await userModel.find({});
    const usersWithAppointments = await userModel
      .find()
      .populate("appointmentId");

    const filteredUsers = testType !== "all" ? users.filter(user=> user.testType === testType) : users

    res.render("examiner", { appointments, users: filteredUsers, testType, usersWithAppointments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


  static post_updateUser = async (req, res) => {
  try {
   const {userId} = req.body
    console.log(userId)
    if(!userId){
      console.log("could not find this user")
    }
    const { comment, passFail } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.comment = comment;
    user.isTestPassed = passFail;

    await user.save();

    res.redirect('/examiner');

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

  

}

export default Controller;