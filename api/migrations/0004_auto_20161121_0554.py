# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-21 05:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20161120_1135'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='dimX',
            field=models.PositiveIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='room',
            name='dimY',
            field=models.PositiveIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='room',
            name='dimZ',
            field=models.PositiveIntegerField(default=0),
            preserve_default=False,
        ),
    ]