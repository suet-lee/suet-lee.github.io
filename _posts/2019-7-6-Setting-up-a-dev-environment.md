---
layout: post
title: Setting up a dev environment
comments: true
---

*How to set up a dev environment using Vagrant virtual machines.*

I bought a new laptop recently but I still find myself using my old Acer 90% of the time. It’s old and grimy but is a real solid trooper. The main reason I’m still using it though, is simply because I’ve been too lazy to set up my new laptop with a dev environment and all the software that I use. And also, because I’ve forgotten a little bit how I set up the dev environment in the first place.

I thought I better record the process of setting up my environment so that I have something to refer to, for next time, four years down the line, and also it might help somebody out there (hi how you doing). I use virtual machines to isolate my dev environments, it means I can create environments suited for different projects without messing up existing set ups. It’s nice, clean and contained. I’ll be using an open-source tool called Vagrant to this end, but there are other options like Docker which work slightly differently. See here for more on Vagrant vs. Docker.

We will be installing:

* Virtualization software: VirtualBox, required to run the virtual machines (VMs)
* Vagrant: tool for managing and building VM environments

## Step one: Download software

Download VirtualBox: you can do this [here](https://www.virtualbox.org/wiki/Downloads). There are other options like VMWare. Both are free but VirtualBox is open-source. Next, download Vagrant: [link here](https://www.vagrantup.com/downloads.html).

## Step two: Create a machine

You can use Vagrant to build VMs according on your needs. Every Vagrant machine has a .vagrantfile which determines its features, and most importantly, which base box it is built on. Base boxes (aka Vagrant boxes) are prepackaged dev environments, usually just an operating system and nothing else. It’s then up to you to add the features you require.

You can also use boxes which come provisioned with features like Apache, PHP, Python, etc. For example, I use the Homestead box for my web development environment – it comes with Git, PHP, Nginx and Redis amongst other things, everything you need to get going with a Laravel project.

Vagrant has a list of publicly available boxes [here](https://app.vagrantup.com/boxes/search). I’ll be using the *ubuntu/precise32* box. In the directory where you’ll be keeping your vagrant boxes, create a folder for your new machine and execute the following from a command line:

```$ vagrant init ubuntu/precise32```

You can replace ubuntu/precise32 with the name of the box you want. A .vagrantfile will have been created. You can now open it in a text editor and modify it to your requirements. On initialization, the .vagrantfile contains the basic config boilerplate. It's written in Ruby but you don't need to know anything beyond the lines of config that you want to change or add. The initial config will just have  *config.vm.box* specified. Here is the .vagrantfile I use for my Octave dev environment, courtesy of [github/Starefossen](https://gist.github.com/Starefossen/9353638):

```
# -- mode: ruby --
# vi: set ft=ruby :
 
# Boostrap Script
$script = <<SCRIPT
# Update & Install
apt-get update
apt-get install -y octave gnuplot
echo "cd /vagrant" >> /home/vagrant/.bashrc
SCRIPT
 
Vagrant.configure("2") do |config|
 
        # All Vagrant configuration is done here. The most common configuration
        # options are documented and commented below. For a complete reference,
        # please see the online documentation at vagrantup.com.
        # Every Vagrant virtual environment requires a box to build off of.
        config.vm.box = "ubuntu/precise32"
   
        # The url from where the 'config.vm.box' box will be fetched if it
        # doesn't already exist on the user's system.
        # config.vm.box_url = "http://files.vagrantup.com/precise32.box"

        config.vm.synced_folder "C:/Users/MyUser/Code/octave", "/vagrant/Code"

        # A Vagrant plugin that helps you reduce the amount of coffee you drink while
        # waiting for boxes to be provisioned by sharing a common package cache among
        # similiar VM instances. Kinda like vagrant-apt_cache or this magical snippet
        # but targetting multiple package managers and Linux distros.
        if Vagrant.has_plugin?("vagrant-cachier")
                config.cache.auto_detect = true
        # For VirtualBox, we want to enable NFS for shared folders # config.cache.enable_nfs = true
        end

        # The shell provisioner allows you to upload and execute a script as the root
        # user within the guest machine.
        config.vm.provision :shell, :inline => $script
  
        # Provider-specific configuration so you can fine-tune various
        # backing providers for Vagrant. These expose provider-specific options.
        # Example for VirtualBox:
        config.vm.provider :virtualbox do |vb|
                vb.customize ["modifyvm", :id, "--memory", "256", "--cpus", "2"]
        end
 
 end
 ```
 
For me, the second most useful item to specify is *config.vm.synced_folder*. This variable will sync a folder on the VM to a folder on the host machine, which means you can edit files with a text editor on your host machine.

## Step three: Run the machine

To start up the machine use:

```$ vagrant up```

The machine will now be created and you can see it listed in VirtualBox.

##### Other useful vagrant commands:

```$ vagrant ssh```

SSH into the machine, you can then add features using pip or any package installer you like. Use exit to exit.

```$ vagrant halt```

Powers down the machine. Like shutting down a computer.

```$ vagrant reload```

Restarts the machine.

```$ vagrant provision```

If you modify the .vagrantfile at any point and want to implement the changes, you will need to run this command.

```$ vagrant destroy```

Destroys the machine – removes the machine entirely and you will no longer see it in the list of VMs in VirtualBox. The .vagrantfile will not be removed however and you can create the machine again using vagrant up. However, any features that you added to the old machine will be lost.

## Other options

There are many other modifications you can make to the .vagrantfile to customize your VM. For one, I had to modify the forwarded port option for my Anaconda box to get jupyter notebook running and accessible on my host machine. You can also create your own base boxes and there’s a great tutorial [here](https://scotch.io/tutorials/how-to-create-a-vagrant-base-box-from-an-existing-one) if you’re keen.

