
We will be using the fastai vision library for building our classifier and BingImageCrawler from icrawler to collect images for training. You can install icrawler by running
```pip install icrawler```


```python
from fastai.vision import *
```


```python
from icrawler.builtin import (BingImageCrawler, GoogleImageCrawler)
import logging
```

Define the function getImages which takes as arguments the name of the folder to place the image set, a keyword for the image set and the max number of images to collect. This will collect one set of images for a single class.


```python
def getImages(folder, keyword, max_num):
    path = 'data/'
    bing_crawler = BingImageCrawler(downloader_threads=4,storage={'root_dir': path+folder})
    bing_crawler.crawl(keyword=keyword, filters=None, offset=0, max_num=max_num)
```


```python
types = {
    'alder': 'alder tree',
    'ash': 'ash tree',
    'beech': 'beech tree',
    'birch': 'birch tree',
    'cedar': 'cedar tree',
    'chestnut': 'chestnut tree',
    'elm': 'elm tree',
    'lime': 'lime tree',
    'maple': 'maple tree',
    'oak': 'oak tree',
    'scots_pine': 'scots pine tree',
    'white_poplar': 'white poplar tree',
    'spruce_tree': 'spruce tree',
    'willow': 'willow tree'
}
```

Run the following code to generate data sets for each type of tree. These are the 14 common trees in the UK according to <a href="https://www.lwtreecare.co.uk/common-uk-trees">https://www.lwtreecare.co.uk/common-uk-trees</a>


```python
for key, item in types.items():
    getImages(key, item, 300)
```

We want to make the results of model training reproducible - to do this set the seed value of NumPy's pseudo-random number generator. Here is a good article on why reproducibility is important <a href="https://towardsdatascience.com/reproducible-machine-learning-cf1841606805">https://towardsdatascience.com/reproducible-machine-learning-cf1841606805</a>


```python
import numpy as np
np.random.seed(42)

path = "data"
data = ImageDataBunch.from_folder("data", train=".", valid_pct=0.2,
        ds_tfms=get_transforms(), size=224, num_workers=4).normalize(imagenet_stats)
```


```python
data.classes, data.c, len(data.train_ds), len(data.valid_ds)
```

Let's have a look at our data!


```python
data.show_batch(rows=5, figsize=(7,8))
```

We build a classifier using resnet34 and the one cycle policy. The one cycle policy essentially varies the learning rate between an upper and lower bound during the training period. Here we call fit_one_cycle with 4 training epochs - so we do a single cycle between the bounds of the learning rate when training over 4 iterations of data.

This is a nice explanation with diagrams! : <a href="https://iconof.com/1cycle-learning-rate-policy/">https://iconof.com/1cycle-learning-rate-policy/</a>


```python
learn = cnn_learner(data, models.resnet34, metrics=error_rate)
```


```python
learn.fit_one_cycle(4)
```

If you find that training the model throws an "Interrupted" error it may be due to shortage of computer RAM. Try setting the parameter num_workers=1 in the ImageDataBunch.

Let's save a copy of our model - this is a useful tool because we can train the model further knowing we have a backup save point if something goes wrong, or the training decreases model performance.


```python
learn.save('stage-1')
```

unfreeze() sets all layers of the model as trainable - so further training will modify all the weights in the model!

We also look at the learning rate over the training period with lr_find() - this will help us find the a good upper and lower bound for varying learning rate.


```python
learn.unfreeze()
```


```python
learn.lr_find()
```


```python
learn.recorder.plot()
```

Let's try training with a learning rate range between 1e-05 and 1e-04 - this is where the loss is does not vary greatly.


```python
learn.fit_one_cycle(5, max_lr=slice(1e-5,1e-4))
```


```python
learn.save('stage-2')
```


```python
learn.load('stage-2');
```


```python
interp = ClassificationInterpretation.from_learner(learn)
```


```python
interp.plot_confusion_matrix()
```

We can do some cleaning of the data using fastai.widgets. ImageCleaner allows us to remove irrelevant images - they are not physically deleted but a csv is created with a list of whitelisted images.


```python
from fastai.widgets import *
```


```python
path = "data"
db = (ImageList.from_folder(path)
                   .split_none()
                   .label_from_folder()
                   .transform(get_transforms(), size=224)
                   .databunch()
     )
```


```python
learn_cln2 = cnn_learner(db, models.resnet34, metrics=error_rate)

learn_cln2.load('stage-2');
```


```python
ds, idxs = DatasetFormatter().from_toplosses(learn_cln2)
```


```python
ImageCleaner(ds, idxs, path)
```

Now we can create a data bunch using the cleaned set of images for the next step of cleaning - removing duplicates. The whitelist of images is stored in "cleaned.csv" in the data folder. Again, we use the ImageCleaner this time setting duplicates=True


```python
db2 = (ImageList.from_csv(path, 'cleaned.csv', folder='.')
                    .split_none()
                    .label_from_df()
                    .transform(get_transforms(), size=224)
                    .databunch()
      )
```


```python
learn_cln = cnn_learner(db2, models.resnet34, metrics=error_rate)

learn_cln.load('stage-2');
```


```python
ds, idxs = DatasetFormatter().from_similars(learn_cln)
```


```python
ImageCleaner(ds, idxs, path, duplicates=True)
```

With our cleaned data, we can create a new data bunch. We also normalize our data using ImageNet stats. We repeat the training process with the cleaned data.


```python
import numpy as np
```


```python
np.random.seed(42)
path = "data"
db3 = ImageDataBunch.from_csv(path, csv_labels='cleaned.csv', valid_pct=0.2,
        ds_tfms=get_transforms(), size=224, num_workers=4).normalize(imagenet_stats)
```


```python
learn2 = cnn_learner(db3, models.resnet34, metrics=error_rate)
```


```python
learn2.fit_one_cycle(4)
```


```python
learn2.save('stage-cleaned')
```


```python
learn2.unfreeze()
```


```python
learn2.lr_find()
```


```python
learn2.fit_one_cycle(5, max_lr=slice(1e-5,1e-4))
```


```python
learn2.save('stage-cleaned-2')
```


```python
learn2.load('stage-cleaned-2')
interp2 = ClassificationInterpretation.from_learner(learn)
```


```python
interp2.plot_confusion_matrix()
```

The final step is to export our learner. The model is exported as a .pkl file which can then be loaded for use in production, in a web app for example.


```python
learn2.export()
```


```python
defaults.device = torch.device('cpu')
```

Download a image from url for testing and load our model with load_learner for prediction.


```python
import requests

image_url = "..."
img_data = requests.get(image_url).content
with open('test1.jpg', 'wb') as handler:
    handler.write(img_data)
```


```python
path = "data"
img = open_image('test1.jpg')
img
```


```python
learn = load_learner(path)
```


```python
learn.summary
```


```python
pred_class,pred_idx,outputs = learn.predict(img)
pred_class
```
