const express = require('express');
const cors = require('cors');
const app = express();
const template = require("./models/template");
const Data = require('./models/data');
const mongoose = require('mongoose');
const port = 3001; // Ensure this matches the port your server is running on

mongoose.connect('mongodb://127.0.0.1:27017/TaskManager');

// Use CORS middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    
});

app.get('/habbitTemplate/:slug', (req, res) => {
    const { slug } = req.params;
    template.find({ orgNo: slug }).then(users => {
        res.json(users.map(user => user.Tasks)); // Return only Tasks objects
    })
    .catch(err => {
        console.error('Error fetching users', err);
        res.status(500).send('Internal Server Error');
    });
});

app.get('/habbitData/:slug', (req, res) => {
    const { slug } = req.params;
    const date = slug.replace(/-/g, ' ');

    Data.findOne({ date: date })
        .then(info => {
            if (!info) {
                res.status(404).json({ error: 'Data not found' });
            } else {
                res.json(info); // Return data found for the specified date
            }
        })
        .catch(err => {
            console.error('Error fetching data', err);
            res.status(500).send('Internal Server Error');
        });

});


app.post('/saveData',async (req, res) => {
    const { date, total_points, habit_data } = req.body;
    
    try {
        const existingData = await Data.findOne({ date: date });
        
        if (existingData) {
            existingData.total_points = total_points;
            existingData.habit_data = habit_data;
            await existingData.save(); // Save the updated document

            return res.status(200).send('Data updated successfully');
            
        }else{
            
            const newData = new Data({
                date,
                total_points,
                habit_data
            });
    
            await newData.save();
            res.status(201).send('Data saved successfully');
        }
        
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Internal Server Error');
    }

    
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});


