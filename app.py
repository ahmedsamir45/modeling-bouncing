import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)



# Euler's method
def euler_method(y0, v0, dt, time_limit, r):
    times = [0]
    heights = [y0]
    velocities = [v0]
    t = 0
    y, v = y0, v0
    
    while t <= time_limit:
        y =y+  v * dt
        v =v- 9.81 * dt
        times.append(t)
        heights.append(y)
        velocities.append(v)
        if y <= 0:
            y =0
            v = -v * r
        
        t += dt
    return np.array(times), np.array(heights),np.array(velocities)
import numpy as np

@app.route('/')
def index():
    return render_template('index.html',custom="index")


@app.route('/documentation')
def documentation():
    return render_template('documentation.html')


@app.route('/tool')
def tool():
    return render_template('tool.html',js="main",custom="tool")





@app.route('/plot', methods=['POST'])
def plot():
    # Get form data
    r = float(request.form['r'])
    dt = float(request.form['dt'])
    y0 = float(request.form['y0'])
    v0 = float(request.form['v0'])
    mass = float(request.form['m'])
    time_limit = float(request.form['time_limit'])

    # Compute results for Euler's method
    times_euler, heights_euler, velocities_euler = euler_method(y0, v0, dt, time_limit, r)

    # Calculate kinetic energy for Euler's method
    kinetic_energy_euler = 0.5 * mass * velocities_euler**2

    # Plot for Euler's method (Height)
    plt.figure()
    plt.plot(times_euler, heights_euler, label='Euler')
    plt.xlabel('Time (s)')
    plt.ylabel('Height (m)')
    plt.title('Euler’s Method')
    plt.grid()
    euler_img = BytesIO()
    plt.savefig(euler_img, format='png')
    euler_img.seek(0)
    euler_plot_url = base64.b64encode(euler_img.getvalue()).decode()

    # Plot for Kinetic Energy
    plt.figure()
    plt.plot(times_euler, kinetic_energy_euler, label='Kinetic Energy (Euler)', color='blue')
    plt.xlabel('Time (s)')
    plt.ylabel('Kinetic Energy (J)')
    plt.title('Kinetic Energy Over Time')
    plt.legend()
    plt.grid()
    kinetic_img = BytesIO()
    plt.savefig(kinetic_img, format='png')
    kinetic_img.seek(0)
    kinetic_plot_url = base64.b64encode(kinetic_img.getvalue()).decode()

    # Plot for Velocity
    plt.figure()
    plt.plot(times_euler, velocities_euler, label='Velocity (Euler)', color='green')
    plt.xlabel('Time (s)')
    plt.ylabel('Velocity (m/s)')
    plt.title('Velocity Over Time')
    plt.legend()
    plt.grid()
    velocity_img = BytesIO()
    plt.savefig(velocity_img, format='png')
    velocity_img.seek(0)
    velocity_plot_url = base64.b64encode(velocity_img.getvalue()).decode()

    return jsonify({
        'euler': euler_plot_url,
        'kinetic': kinetic_plot_url,
        'velocity': velocity_plot_url,
    })

if __name__ == '__main__':
    app.run(debug=True)

