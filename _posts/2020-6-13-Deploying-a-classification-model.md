---
title: Deploying a classification model (with Flask, Apache, virtual environments and WSGI)
tags:
    - fastai
    - devops
    - flask
    - ubuntu
    - apache
    - wsgi
    - virtual environment
    - digital ocean
categories:
    - fastai
---

*In which we deploy our classifier to a cloud server.*

I thought training the classifier was the difficult part but it turns out that deployment was the real test... Here I record the steps I took and issues I encountered to get my classifier 'whats-that-tree' working in the cloud as a reminder to self, and to help anyone who might have similar issues!

## Setup

Cloud server: DigitalOcean  
App framework: Flask  
OS: Ubuntu 16.04  
Server memory: 2GB  
Web server: Apache

----

One of the main hurdles was getting fastai installed inside a virtual environment and having my web server use that environment to serve the Flask application. I've used mod_wsgi with Flask before to set up another project but it was a few years ago so I needed some refreshing on the details. The [Flask documentation](https://flask.palletsprojects.com/en/1.1.x/deploying/mod_wsgi/) is a good starting point and so is this [guide](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-flask-application-on-an-ubuntu-vps). ~~However, neither touch on how to have mod_wsgi serve the app with a specific virtual environment.~~ *(See end of post / Flask documentation)*

### Step 1

Install python3 (I installed version 3.6), virtualenv, apache2 if you haven't already:  
````
sudo apt-get update
sudo apt-get install python3.6
pip install virtualenv
sudo apt-get install apache2
sudo apt-get install apache2-dev
````
The last command is for apache2 dev tools. I can't remember if that's necessary now but I did install it at some point so throwing it in for good measure.  

### Step 2

Create a virtual environment for the Flask app:  
````
virtualenv -p python3.6 venv
````  
Activate the virtual environment:  
````
. venv/bin/activate
````  

You need to install a mod_wsgi version for python3:  
````
pip3 install mod_wsgi
````  

Now to install fastai - since my server only has CPU I opted to first install a CPU version of pytorch before installing fastai:   
You can find the correct installation verion for your server [here](https://pytorch.org/get-started/locally/)  
````
pip3 install torch==1.5.0+cpu torchvision==0.6.0+cpu -f https://download.pytorch.org/whl/torch_stable.html  
pip3 install fastai
````  

During the installation of fastai, I hit an issue installing bottleneck. If I remember correctly it was to do with this error:  
`fatal error: Python.h: No such file or directory compilation terminated.`
If you come across this, you need to install python dev:  
````
sudo apt install python3.6-dev
````

### Step 3

Now to serve the Flask app using WSGI and Apache. You need to create a file `app.wsgi` which Apache uses to serve the app. I used the following folder structure:  
````
|----whats-that-tree
|---------app.wsgi
|---------venv
|---------app
|--------------.env
|--------------__init__.py
|--------------modules
|--------------README.md
|--------------static
|--------------templates
````

In `app.wsgi`:  
````
#!/usr/bin/python
import sys
sys.path.insert(0,"/path/to/whats-that-tree/")

from app import app as application
````
Where the path to pass to `sys.path.insert` is the path to the app directory.  

Create a `whats-that-tree.conf` file:  
````
<VirtualHost *:80>
        ServerName your_domain
        ServerAdmin your@gmail.com

        LoadModule wsgi_module "/path/to/whats-that-tree/venv/lib/python3.6/site-packages/mod_wsgi/server/mod_wsgi-py36.cpython-36m-x86_64-linux-gnu.so"
        WSGIDaemonProcess app_name python-home="/path/to/whats-that-tree/venv"
        WSGIProcessGroup app_name
        WSGIApplicationGroup %{GLOBAL}

        WSGIScriptAlias / /path/to/whats-that-tree/app.wsgi

        <Directory "/path/to/whats-that-tree/app">
                Options Indexes FollowSymLinks
                AllowOverride All
                Require all granted
        </Directory>
        Alias /static /path/to/whats-that-tree/app/static
        <Directory "/path/to/whats-that-tree/app/static">
                Order allow,deny
                Allow from all
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
````
You will need to use `LoadModule` to load mod_wsgi from the correct path in your virtual environment. You can find the correct directives with command:
````
mod_wsgi-express module-config
````
See: [https://pypi.org/project/mod-wsgi/](https://pypi.org/project/mod-wsgi/)

### Step 4

Enable the site with `sudo a2ensite whats-that-tree` and reload apache `sudo service apache2 reload`: it should work if everything is configured correctly.  
One last thing, I received many 'Truncated or oversized response headers received from daemon process' error messages from Apache and I tried many many fixes. Turns out my server just needed more memory (it initially had 1GB) and scaling up to 2GB was enough!

### Fin

Turns out there's a easier way (somewhat) to get Apache to use the virtual environment. I completely missed it in this [guide](https://flask.palletsprojects.com/en/1.1.x/deploying/mod_wsgi/). You can add this to the top of the `app.wsgi` file:  
````
activate_this = '/path/to/venv/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))
````
The `LoadModule` directive is no longer needed and you can replace:  
````
WSGIDaemonProcess app_name python-home="/path/to/whats-that-tree/venv"
````  
With:  
````
WSGIDaemonProcess app_name
````  

That's it!

### Links

My classifier app on GitHub: [https://github.com/suet-lee/whats-that-tree](https://github.com/suet-lee/whats-that-tree)  
A live version of the classifier, go find a tree to classify! [http://whats-that-tree.suetlee.com](http://whats-that-tree.suetlee.com)
